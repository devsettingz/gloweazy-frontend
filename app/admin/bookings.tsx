/**
 * Admin Booking Management
 * View and manage all bookings with status updates
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBookings, updateBookingStatus } from "../../utils/adminApi";

interface Booking {
  _id: string;
  bookingNumber: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  stylist: {
    name: string;
    email: string;
  };
  service: {
    name: string;
    price: number;
    duration: number;
  };
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: "#FF950020", text: "#FF9500", icon: "time" },
  confirmed: { bg: "#007AFF20", text: "#007AFF", icon: "checkmark-circle" },
  in_progress: { bg: "#5856D620", text: "#5856D6", icon: "play" },
  completed: { bg: "#34C75920", text: "#34C759", icon: "checkmark-done" },
  cancelled: { bg: "#FF3B3020", text: "#FF3B30", icon: "close-circle" },
};

const paymentStatusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FF950020", text: "#FF9500" },
  paid: { bg: "#34C75920", text: "#34C759" },
  refunded: { bg: "#8E8E9320", text: "#8E8E93" },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [searchQuery, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      
      const data = await getBookings(params);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedBooking) return;
    
    try {
      await updateBookingStatus(selectedBooking._id, newStatus);
      setStatusModalVisible(false);
      setModalVisible(false);
      loadBookings();
      Alert.alert("Success", `Booking status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert("Error", "Failed to update booking status");
    }
  };

  const openBookingDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadBookings}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Status Summary */}
      <View style={styles.statsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statItem,
                statusFilter === status && styles.statItemActive,
              ]}
              onPress={() => setStatusFilter(statusFilter === status ? "" : status)}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: statusColors[status]?.bg || "#F5F5F5" },
                ]}
              >
                <Ionicons
                  name={statusColors[status]?.icon as any}
                  size={16}
                  color={statusColors[status]?.text || "#666"}
                />
              </View>
              <Text style={styles.statNumber}>{count}</Text>
              <Text style={styles.statLabel}>
                {status.replace("_", " ").charAt(0).toUpperCase() +
                  status.replace("_", " ").slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.clearFilterButton, !statusFilter && styles.clearFilterHidden]}
          onPress={() => setStatusFilter("")}
        >
          <Ionicons name="close" size={14} color="#666" />
          <Text style={styles.clearFilterText}>Clear Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {loading ? (
        <ActivityIndicator size="large" color="#E75480" style={styles.loader} />
      ) : (
        <ScrollView style={styles.bookingList}>
          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          ) : (
            bookings.map((booking) => {
              const statusConfig = statusColors[booking.status] || statusColors.pending;
              return (
                <TouchableOpacity
                  key={booking._id}
                  style={styles.bookingCard}
                  onPress={() => openBookingDetail(booking)}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingNumber}>
                      <Text style={styles.bookingNumberText}>
                        #{booking.bookingNumber}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.bg },
                      ]}
                    >
                      <Ionicons
                        name={statusConfig.icon as any}
                        size={12}
                        color={statusConfig.text}
                      />
                      <Text style={[styles.statusText, { color: statusConfig.text }]}>
                        {booking.status.replace("_", " ")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Client</Text>
                        <Text style={styles.detailValue}>{booking.client?.name}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Stylist</Text>
                        <Text style={styles.detailValue}>{booking.stylist?.name}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Service</Text>
                        <Text style={styles.detailValue}>{booking.service?.name}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Amount</Text>
                        <Text style={styles.amountValue}>
                          GHS {booking.totalAmount?.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Date & Time</Text>
                        <View style={styles.dateTimeRow}>
                          <Ionicons name="calendar-outline" size={12} color="#666" />
                          <Text style={styles.dateTimeText}>
                            {new Date(booking.date).toLocaleDateString()}
                          </Text>
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#666"
                            style={styles.timeIcon}
                          />
                          <Text style={styles.dateTimeText}>{booking.time}</Text>
                        </View>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Payment</Text>
                        <View
                          style={[
                            styles.paymentBadge,
                            {
                              backgroundColor:
                                paymentStatusColors[booking.paymentStatus]?.bg || "#F5F5F5",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.paymentText,
                              {
                                color:
                                  paymentStatusColors[booking.paymentStatus]?.text || "#666",
                              },
                            ]}
                          >
                            {booking.paymentStatus}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {booking.notes && (
                    <View style={styles.notesSection}>
                      <Ionicons name="document-text-outline" size={14} color="#999" />
                      <Text style={styles.notesText} numberOfLines={1}>
                        {booking.notes}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Booking Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBooking && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      Booking #{selectedBooking.bookingNumber}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Created on{" "}
                      {new Date(selectedBooking.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Status Section */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Current Status</Text>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusBadgeLarge,
                          {
                            backgroundColor: statusColors[selectedBooking.status]?.bg,
                          },
                        ]}
                      >
                        <Ionicons
                          name={statusColors[selectedBooking.status]?.icon as any}
                          size={16}
                          color={statusColors[selectedBooking.status]?.text}
                        />
                        <Text
                          style={[
                            styles.statusTextLarge,
                            { color: statusColors[selectedBooking.status]?.text },
                          ]}
                        >
                          {selectedBooking.status.replace("_", " ")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.changeStatusBtn}
                        onPress={() => setStatusModalVisible(true)}
                      >
                        <Text style={styles.changeStatusText}>Change Status</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Client Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Client Information</Text>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoName}>{selectedBooking.client?.name}</Text>
                      <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={14} color="#666" />
                        <Text style={styles.infoText}>{selectedBooking.client?.email}</Text>
                      </View>
                      {selectedBooking.client?.phone && (
                        <View style={styles.infoRow}>
                          <Ionicons name="call-outline" size={14} color="#666" />
                          <Text style={styles.infoText}>
                            {selectedBooking.client?.phone}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Stylist Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Stylist Information</Text>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoName}>{selectedBooking.stylist?.name}</Text>
                      <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={14} color="#666" />
                        <Text style={styles.infoText}>{selectedBooking.stylist?.email}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Service Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Service Details</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.serviceRow}>
                        <Text style={styles.serviceName}>
                          {selectedBooking.service?.name}
                        </Text>
                        <Text style={styles.servicePrice}>
                          GHS {selectedBooking.totalAmount?.toFixed(2)}
                        </Text>
                      </View>
                      {selectedBooking.service?.duration && (
                        <View style={styles.infoRow}>
                          <Ionicons name="time-outline" size={14} color="#666" />
                          <Text style={styles.infoText}>
                            {selectedBooking.service?.duration} minutes
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Appointment Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Appointment</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <Text style={styles.infoText}>
                          {new Date(selectedBooking.date).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.infoText}>{selectedBooking.time}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Payment</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Status</Text>
                        <View
                          style={[
                            styles.paymentBadgeLarge,
                            {
                              backgroundColor:
                                paymentStatusColors[selectedBooking.paymentStatus]?.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.paymentTextLarge,
                              {
                                color:
                                  paymentStatusColors[selectedBooking.paymentStatus]?.text,
                              },
                            ]}
                          >
                            {selectedBooking.paymentStatus}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Total Amount</Text>
                        <Text style={styles.totalAmount}>
                          GHS {selectedBooking.totalAmount?.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Notes */}
                  {selectedBooking.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>Notes</Text>
                      <View style={styles.notesCard}>
                        <Text style={styles.notesFullText}>{selectedBooking.notes}</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal visible={statusModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContent}>
            <Text style={styles.statusModalTitle}>Update Booking Status</Text>
            <Text style={styles.statusModalSubtitle}>
              Select the new status for this booking
            </Text>

            {["pending", "confirmed", "in_progress", "completed", "cancelled"].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selectedBooking?.status === status && styles.statusOptionActive,
                  ]}
                  onPress={() => handleUpdateStatus(status)}
                >
                  <View
                    style={[
                      styles.statusIcon,
                      { backgroundColor: statusColors[status]?.bg },
                    ]}
                  >
                    <Ionicons
                      name={statusColors[status]?.icon as any}
                      size={18}
                      color={statusColors[status]?.text}
                    />
                  </View>
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedBooking?.status === status && styles.statusOptionTextActive,
                    ]}
                  >
                    {status.replace("_", " ").charAt(0).toUpperCase() +
                      status.replace("_", " ").slice(1)}
                  </Text>
                  {selectedBooking?.status === status && (
                    <Ionicons name="checkmark" size={20} color="#E75480" />
                  )}
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={styles.cancelStatusBtn}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.cancelStatusText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  refreshButton: {
    width: 44,
    height: 44,
    backgroundColor: "#E75480",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  statsRow: {
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    minWidth: 80,
  },
  statItemActive: {
    borderColor: "#E75480",
    backgroundColor: "#FFF5F7",
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  filters: {
    flexDirection: "row",
    marginBottom: 10,
  },
  clearFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
  },
  clearFilterHidden: {
    opacity: 0,
  },
  clearFilterText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  loader: {
    marginTop: 50,
  },
  bookingList: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookingNumber: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookingNumberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  amountValue: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 8,
  },
  paymentBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  notesText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
  },
  modalSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  changeStatusBtn: {
    backgroundColor: "#E75480",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeStatusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
  },
  infoName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#34C759",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666",
  },
  paymentBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentTextLarge: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34C759",
  },
  notesCard: {
    backgroundColor: "#FFF9E6",
    borderRadius: 10,
    padding: 12,
  },
  notesFullText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  statusModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  statusModalSubtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#F5F5F5",
  },
  statusOptionActive: {
    backgroundColor: "#FFF5F7",
    borderWidth: 1,
    borderColor: "#E75480",
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statusOptionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
    textTransform: "capitalize",
  },
  statusOptionTextActive: {
    fontWeight: "600",
    color: "#E75480",
  },
  cancelStatusBtn: {
    marginTop: 8,
    padding: 14,
    alignItems: "center",
  },
  cancelStatusText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
});
