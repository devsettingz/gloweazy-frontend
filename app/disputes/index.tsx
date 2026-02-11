import api from "../../utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import withAdminGuard from "../../utils/withAdminGuard";

const { width } = Dimensions.get("window");

// ✅ Skeleton component for loading state
function DisputeSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonLine, { width: "60%", height: 18 }]} />
      <View style={[styles.skeletonLine, { width: "40%", marginTop: 8 }]} />
      <View style={[styles.skeletonLine, { width: "50%", marginTop: 4 }]} />
      <View style={[styles.skeletonLine, { width: "30%", marginTop: 4 }]} />
    </View>
  );
}

// ✅ Empty state component
function EmptyState({ tab, hasFilters }: { tab: string; hasFilters: boolean }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>
        {hasFilters ? "No matches found" : `No ${tab} disputes`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : tab === "active"
          ? "Great news! There are no active disputes to resolve."
          : "No resolved disputes yet."}
      </Text>
    </View>
  );
}

function DisputesListScreen() {
  const [activeDisputes, setActiveDisputes] = useState<any[]>([]);
  const [resolvedDisputes, setResolvedDisputes] = useState<any[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<null | string>(null);
  const [tab, setTab] = useState<"active" | "resolved">("active");
  const [counts, setCounts] = useState({ active: 0, resolved: 0 });

  const router = useRouter();
  const { updateActivity } = useAuth();

  const fetchDisputes = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [resActive, resResolved] = await Promise.all([
        api.get("/bookings/disputes?status=disputed"),
        api.get("/bookings/disputes?status=resolved"),
      ]);

      const active = resActive.data || [];
      const resolved = resResolved.data || [];

      setActiveDisputes(active);
      setResolvedDisputes(resolved);
      setCounts({ active: active.length, resolved: resolved.length });

      // Set initial filtered data based on current tab
      const currentData = tab === "active" ? active : resolved;
      setFilteredDisputes(currentData);

      await updateActivity();
    } catch (err) {
      console.error("Error fetching disputes:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load disputes",
        text2: "Please try again later ❌",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  // Filter disputes when search, status, or tab changes
  useEffect(() => {
    let results = tab === "active" ? activeDisputes : resolvedDisputes;

    if (search.trim()) {
      const lower = search.toLowerCase();
      results = results.filter(
        (d) =>
          d.service?.toLowerCase().includes(lower) ||
          d.client?.name?.toLowerCase().includes(lower) ||
          d.stylist?.name?.toLowerCase().includes(lower) ||
          d._id?.toLowerCase().includes(lower)
      );
    }

    if (statusFilter) {
      results = results.filter((d) => d.status === statusFilter);
    }

    setFilteredDisputes(results);
  }, [search, statusFilter, tab, activeDisputes, resolvedDisputes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDisputes(true);
  };

  // ✅ Loading skeleton state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Dispute Management</Text>
        <View style={styles.skeletonTabs}>
          <View style={[styles.skeletonTab, { opacity: 0.6 }]} />
          <View style={[styles.skeletonTab, { opacity: 0.3 }]} />
        </View>
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <DisputeSkeleton />}
          contentContainerStyle={styles.list}
        />
      </View>
    );
  }

  const hasFilters = search.trim() !== "" || statusFilter !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispute Management</Text>

      {/* ✅ Tab switcher with counts */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "active" && styles.tabButtonActive]}
          onPress={() => setTab("active")}
        >
          <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>
            Active ({counts.active})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "resolved" && styles.tabButtonActive]}
          onPress={() => setTab("resolved")}
        >
          <Text style={[styles.tabText, tab === "resolved" && styles.tabTextActive]}>
            Resolved ({counts.resolved})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Search bar */}
      <TextInput
        placeholder={`Search ${tab} disputes by client, stylist, or service...`}
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#8E8E93"
      />

      {/* ✅ Status filter buttons */}
      <View style={styles.filterRow}>
        <Button
          title="All"
          onPress={() => setStatusFilter(null)}
          color={!statusFilter ? "#E75480" : "#8E8E93"}
        />
        <Button
          title="Disputed"
          onPress={() => setStatusFilter("disputed")}
          color={statusFilter === "disputed" ? "#E75480" : "#8E8E93"}
        />
        <Button
          title="Confirmed"
          onPress={() => setStatusFilter("confirmed")}
          color={statusFilter === "confirmed" ? "#E75480" : "#8E8E93"}
        />
        <Button
          title="Cancelled"
          onPress={() => setStatusFilter("cancelled")}
          color={statusFilter === "cancelled" ? "#E75480" : "#8E8E93"}
        />
        <Button
          title="Completed"
          onPress={() => setStatusFilter("completed")}
          color={statusFilter === "completed" ? "#E75480" : "#8E8E93"}
        />
      </View>

      {/* ✅ Results count */}
      <Text style={styles.resultsText}>
        Showing {filteredDisputes.length} of {tab === "active" ? counts.active : counts.resolved} {tab} disputes
      </Text>

      {/* ✅ Empty state or list */}
      {filteredDisputes.length === 0 ? (
        <EmptyState tab={tab} hasFilters={hasFilters} />
      ) : (
        <FlatList
          data={filteredDisputes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E75480" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/disputes/${item._id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.service}>{item.service}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.detail}>👤 Client: {item.client?.name || "N/A"}</Text>
              <Text style={styles.detail}>💇 Stylist: {item.stylist?.name || "N/A"}</Text>
              <Text style={styles.detail}>💰 Amount: ${item.amount || "N/A"}</Text>
              <Text style={styles.date}>
                Raised: {new Date(item.updatedAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// Helper function to get status colors
function getStatusColor(status: string): string {
  switch (status) {
    case "disputed":
      return "#FF9500"; // Orange
    case "confirmed":
      return "#34C759"; // Green
    case "cancelled":
      return "#FF3B30"; // Red
    case "completed":
      return "#007AFF"; // Blue
    default:
      return "#8E8E93"; // Gray
  }
}

export default withAdminGuard(DisputesListScreen);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#2C2C2C" },
  list: { paddingTop: 10, paddingBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabRow: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#E75480",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  tabTextActive: {
    color: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#F2F2F7",
    fontSize: 14,
    color: "#2C2C2C",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  service: { fontSize: 16, fontWeight: "700", color: "#2C2C2C", flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },
  detail: { fontSize: 14, marginTop: 4, color: "#3A3A3C" },
  date: { fontSize: 12, marginTop: 8, color: "#8E8E93" },
  // Skeleton styles
  skeletonCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
  },
  skeletonTabs: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  skeletonTab: {
    flex: 1,
    height: 44,
    backgroundColor: "#E5E5EA",
    borderRadius: 8,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
