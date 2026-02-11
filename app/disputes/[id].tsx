import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { notifyDisputeResolved } from "../../utils/notifications";
import withRoleGuard from "../../utils/withRoleGuard";
import api from "../../utils/api";

// Types
interface DisputeHistoryItem {
  resolvedBy: string;
  resolution: "confirmed" | "cancelled";
  timestamp: string;
  notes?: string;
  status: string;
}

interface Booking {
  _id: string;
  service: string;
  status: string;
  amount?: number;
  client?: { name: string; email: string; id: string };
  stylist?: { name: string; email: string; id: string };
  bookingDate?: string;
  bookingTime?: string;
  disputeHistory?: DisputeHistoryItem[];
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

function DisputeResolutionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, updateActivity } = useAuth();
  const { releaseEscrow } = useWallet();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState("");
  const [previousBooking, setPreviousBooking] = useState<Booking | null>(null);
  const [escrowLoading, setEscrowLoading] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchBooking();
  }, [id]);

  // ✅ 5-second polling to sync status if another admin resolves
  useEffect(() => {
    if (!id) return;

    const intervalId = setInterval(() => {
      // Only poll if not currently resolving (to avoid conflicts with optimistic update)
      if (!resolving) {
        pollBooking();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, resolving]);

  const pollBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      const freshBooking = res.data as Booking;

      setBooking((prev) => {
        if (!prev) return freshBooking;

        // Only update if status changed (to avoid unnecessary re-renders)
        if (prev.status !== freshBooking.status) {
          Toast.show({
            type: "info",
            text1: "Status updated",
            text2: `Booking is now ${freshBooking.status}`,
          });
          return freshBooking;
        }

        // Update other fields but preserve local state if status is same
        return freshBooking;
      });
    } catch (err) {
      // Silently fail on poll - don't show error toast for background updates
      console.error("Poll error:", err);
    }
  };

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      console.error("Error fetching booking:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load booking",
        text2: "Please try again later ❌",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (resolution: "confirmed" | "cancelled") => {
    // Show confirmation dialog
    Alert.alert(
      `Resolve as ${resolution.charAt(0).toUpperCase() + resolution.slice(1)}`,
      `Are you sure you want to mark this booking as ${resolution}? This action will update the booking status and notify both parties.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: resolution === "cancelled" ? "destructive" : "default",
          onPress: () => executeResolution(resolution),
        },
      ]
    );
  };

  const executeResolution = async (resolution: "confirmed" | "cancelled") => {
    // ✅ Save current state for potential rollback
    const bookingBeforeUpdate = booking;
    setPreviousBooking(bookingBeforeUpdate);

    const payload = {
      status: resolution,
      resolvedBy: user?.name ?? "Admin",
      resolvedById: user?.id,
      timestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
      previousStatus: booking?.status,
    };

    // ✅ Optimistically update local state (before API call)
    setBooking((prev) => {
      if (!prev) return null;
      const historyItem: DisputeHistoryItem = {
        resolvedBy: payload.resolvedBy,
        resolution,
        timestamp: payload.timestamp,
        notes: payload.notes,
        status: resolution,
      };
      return {
        ...prev,
        status: resolution,
        disputeHistory: [...(prev.disputeHistory || []), historyItem],
      };
    });

    try {
      setResolving(true);

      // ✅ Use api client for automatic token handling
      await api.patch(`/bookings/${id}/resolve`, payload);

      // ✅ Release escrow based on resolution
      setEscrowLoading(true);
      const toStylist = resolution === "confirmed";
      const escrowSuccess = await releaseEscrow(id as string, toStylist);
      setEscrowLoading(false);

      if (!escrowSuccess) {
        // Show warning but don't rollback - dispute is still resolved
        Toast.show({
          type: "error",
          text1: "Escrow release failed",
          text2: "Dispute resolved but payment needs manual release ⚠️",
          visibilityTime: 5000,
        });
      }

      // ✅ Notify both parties about dispute resolution
      if (booking?.client?.id && booking?.stylist?.id) {
        const { clientNotified, stylistNotified } = await notifyDisputeResolved(
          booking.client.id,
          booking.stylist.id,
          resolution,
          id as string,
          booking.service
        );

        if (!clientNotified || !stylistNotified) {
          console.warn("Failed to notify one or more parties about dispute resolution");
        }
      }

      await updateActivity();

      Toast.show({
        type: "success",
        text1: "Dispute resolved",
        text2: `Booking marked as ${resolution} ✅`,
      });

      setNotes("");
      setPreviousBooking(null); // Clear rollback state on success

      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      // ✅ Rollback: Restore previous state on error
      setBooking(bookingBeforeUpdate);

      console.error("Resolution error:", err);
      Toast.show({
        type: "error",
        text1: "Resolution failed",
        text2: err?.response?.data?.message || "Could not resolve dispute ❌",
      });
    } finally {
      setResolving(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "disputed":
        return "#FF9500";
      case "confirmed":
        return "#34C759";
      case "cancelled":
        return "#FF3B30";
      case "completed":
        return "#007AFF";
      default:
        return "#8E8E93";
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E75480" />
        <Text style={styles.loadingText}>Loading dispute details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Booking not found</Text>
        <Text style={styles.errorSubtitle}>
          The booking you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isResolved = ["confirmed", "cancelled", "completed"].includes(booking.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dispute Resolution</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(booking.status) },
          ]}
        >
          <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Booking Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Booking Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service:</Text>
          <Text style={styles.detailValue}>{booking.service}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>${booking.amount ?? "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {booking.bookingDate
              ? new Date(booking.bookingDate).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{booking.bookingTime ?? "N/A"}</Text>
        </View>
      </View>

      {/* Parties Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Parties</Text>
        <View style={styles.partySection}>
          <Text style={styles.partyLabel}>Client</Text>
          <Text style={styles.partyName}>{booking.client?.name || "N/A"}</Text>
          <Text style={styles.partyEmail}>{booking.client?.email || "N/A"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.partySection}>
          <Text style={styles.partyLabel}>Stylist</Text>
          <Text style={styles.partyName}>{booking.stylist?.name || "N/A"}</Text>
          <Text style={styles.partyEmail}>{booking.stylist?.email || "N/A"}</Text>
        </View>
      </View>

      {/* Dispute Reason */}
      {booking.disputeReason && (
        <View style={[styles.card, styles.disputeCard]}>
          <Text style={styles.cardTitle}>⚠️ Dispute Reason</Text>
          <Text style={styles.disputeText}>{booking.disputeReason}</Text>
        </View>
      )}

      {/* Resolution Actions */}
      {!isResolved && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✍️ Resolution Notes</Text>
          <TextInput
            placeholder="Add notes about your decision (optional)..."
            value={notes}
            onChangeText={setNotes}
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholderTextColor="#8E8E93"
            editable={!resolving}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.resolveButton, styles.confirmButton, (resolving || escrowLoading) && styles.disabledButton]}
              onPress={() => resolveDispute("confirmed")}
              disabled={resolving || escrowLoading}
            >
              {(resolving || escrowLoading) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.resolveButtonText}>✓ Confirm Booking</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resolveButton, styles.cancelButton, (resolving || escrowLoading) && styles.disabledButton]}
              onPress={() => resolveDispute("cancelled")}
              disabled={resolving || escrowLoading}
            >
              {(resolving || escrowLoading) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.resolveButtonText}>✗ Cancel Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Resolution History */}
      {booking.disputeHistory && booking.disputeHistory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📜 Resolution History</Text>
          <FlatList
            data={booking.disputeHistory.slice().reverse()}
            keyExtractor={(_, idx) => idx.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyAction}>
                    {item.resolution === "confirmed" ? "✓ Confirmed" : "✗ Cancelled"}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.historyBy}>by {item.resolvedBy}</Text>
                {item.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.historyNotes}>📝 {item.notes}</Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      )}

      {/* Spacer for scroll */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default withRoleGuard(DisputeResolutionScreen, "admin");

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F2F2F7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#666", fontSize: 14 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: "600", color: "#2C2C2C", marginBottom: 8 },
  errorSubtitle: { fontSize: 14, color: "#8E8E93", textAlign: "center", marginBottom: 20 },
  backButton: {
    backgroundColor: "#E75480",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#2C2C2C" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disputeCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#2C2C2C" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: { fontSize: 14, color: "#8E8E93" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#2C2C2C" },
  partySection: { marginBottom: 8 },
  partyLabel: { fontSize: 12, color: "#8E8E93", marginBottom: 2, textTransform: "uppercase" },
  partyName: { fontSize: 15, fontWeight: "600", color: "#2C2C2C" },
  partyEmail: { fontSize: 13, color: "#8E8E93" },
  divider: { height: 1, backgroundColor: "#E5E5EA", marginVertical: 12 },
  disputeText: { fontSize: 14, color: "#3A3A3C", lineHeight: 20 },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#2C2C2C",
    backgroundColor: "#F9F9FB",
    marginBottom: 16,
  },
  actions: { gap: 12 },
  resolveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButton: { backgroundColor: "#34C759" },
  cancelButton: { backgroundColor: "#FF3B30" },
  disabledButton: { opacity: 0.6 },
  resolveButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyAction: { fontSize: 14, fontWeight: "600", color: "#2C2C2C" },
  historyTime: { fontSize: 12, color: "#8E8E93" },
  historyBy: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  notesContainer: {
    backgroundColor: "#F9F9FB",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  historyNotes: { fontSize: 13, color: "#3A3A3C", fontStyle: "italic" },
});
