/**
 * Admin Financial Management
 * Overview of transactions, revenue reports, and wallet adjustments
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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTransactions, getRevenueReport, adjustWallet } from "../../utils/adminApi";

interface Transaction {
  _id: string;
  type: "payment" | "refund" | "withdrawal" | "deposit" | "adjustment";
  amount: number;
  status: "pending" | "completed" | "failed";
  user: {
    name: string;
    email: string;
  };
  description: string;
  createdAt: string;
}

interface RevenueData {
  labels: string[];
  data: number[];
  total: number;
}

const { width } = Dimensions.get("window");

const transactionColors: Record<string, { bg: string; text: string }> = {
  payment: { bg: "#34C75920", text: "#34C759" },
  refund: { bg: "#FF3B3020", text: "#FF3B30" },
  withdrawal: { bg: "#FF950020", text: "#FF9500" },
  deposit: { bg: "#007AFF20", text: "#007AFF" },
  adjustment: { bg: "#5856D620", text: "#5856D6" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FF950020", text: "#FF9500" },
  completed: { bg: "#34C75920", text: "#34C759" },
  failed: { bg: "#FF3B3020", text: "#FF3B30" },
};

export default function AdminFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "adjust">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  
  // Wallet adjustment form
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    userId: "",
    amount: "",
    reason: "",
  });

  // Date range for revenue
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    loadData();
  }, [searchQuery, typeFilter, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load transactions
      const txParams: any = {};
      if (searchQuery) txParams.search = searchQuery;
      if (typeFilter) txParams.type = typeFilter;
      const txData = await getTransactions(txParams);
      setTransactions(txData.transactions || []);
      
      // Load revenue report
      const revParams: any = { groupBy: dateRange };
      const revData = await getRevenueReport(revParams);
      setRevenue(revData);
    } catch (error) {
      console.error("Failed to load finance data:", error);
      Alert.alert("Error", "Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustWallet = async () => {
    const amount = parseFloat(adjustForm.amount);
    if (!adjustForm.userId || isNaN(amount) || !adjustForm.reason) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await adjustWallet(adjustForm.userId, amount, adjustForm.reason);
      setAdjustModalVisible(false);
      setAdjustForm({ userId: "", amount: "", reason: "" });
      loadData();
      Alert.alert("Success", `Wallet adjusted by GHS ${amount.toFixed(2)}`);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to adjust wallet");
    }
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount?.toFixed(2) || "0.00"}`;
  };

  const calculateStats = () => {
    const totalRevenue = transactions
      .filter((t) => t.type === "payment" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRefunds = transactions
      .filter((t) => t.type === "refund" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingAmount = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalRevenue, totalRefunds, pendingAmount, netRevenue: totalRevenue - totalRefunds };
  };

  const stats = calculateStats();

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: "#34C759" }]}>
          <View style={styles.statIconContainer}>
            <View style={[styles.statIconBg, { backgroundColor: "#34C75920" }]}>
              <Ionicons name="cash-outline" size={20} color="#34C759" />
            </View>
          </View>
          <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
          <Text style={styles.statTitle}>Total Revenue</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: "#E75480" }]}>
          <View style={styles.statIconContainer}>
            <View style={[styles.statIconBg, { backgroundColor: "#E7548020" }]}>
              <Ionicons name="trending-up-outline" size={20} color="#E75480" />
            </View>
          </View>
          <Text style={styles.statValue}>{formatCurrency(stats.netRevenue)}</Text>
          <Text style={styles.statTitle}>Net Revenue</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: "#FF3B30" }]}>
          <View style={styles.statIconContainer}>
            <View style={[styles.statIconBg, { backgroundColor: "#FF3B3020" }]}>
              <Ionicons name="return-up-back-outline" size={20} color="#FF3B30" />
            </View>
          </View>
          <Text style={styles.statValue}>{formatCurrency(stats.totalRefunds)}</Text>
          <Text style={styles.statTitle}>Refunds</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: "#FF9500" }]}>
          <View style={styles.statIconContainer}>
            <View style={[styles.statIconBg, { backgroundColor: "#FF950020" }]}>
              <Ionicons name="time-outline" size={20} color="#FF9500" />
            </View>
          </View>
          <Text style={styles.statValue}>{formatCurrency(stats.pendingAmount)}</Text>
          <Text style={styles.statTitle}>Pending</Text>
        </View>
      </View>

      {/* Revenue Chart Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.dateRangeButtons}>
            {["week", "month", "year"].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.rangeButton,
                  dateRange === range && styles.rangeButtonActive,
                ]}
                onPress={() => setDateRange(range as any)}
              >
                <Text
                  style={[
                    styles.rangeButtonText,
                    dateRange === range && styles.rangeButtonTextActive,
                  ]}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          {revenue?.data ? (
            <View style={styles.simpleChart}>
              {revenue.data.map((value, index) => {
                const maxValue = Math.max(...revenue.data, 1);
                const height = (value / maxValue) * 150;
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={styles.chartBarWrapper}>
                      <View
                        style={[
                          styles.chartBar,
                          { height: Math.max(height, 10) },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>
                      {revenue.labels[index]?.slice(0, 3) || ""}
                    </Text>
                    <Text style={styles.chartValue}>
                      {value > 0 ? `GHS${Math.round(value)}` : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={48} color="#CCC" />
              <Text style={styles.chartPlaceholderText}>No revenue data available</Text>
            </View>
          )}
        </View>

        <View style={styles.revenueSummary}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Total Revenue ({dateRange})</Text>
            <Text style={styles.revenueAmount}>
              {formatCurrency(revenue?.total || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setActiveTab("transactions")}
          >
            <View style={[styles.actionIconBg, { backgroundColor: "#007AFF20" }]}>
              <Ionicons name="list-outline" size={24} color="#007AFF" />
            </View>
            <Text style={styles.actionText}>View Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setAdjustModalVisible(true)}
          >
            <View style={[styles.actionIconBg, { backgroundColor: "#5856D620" }]}>
              <Ionicons name="wallet-outline" size={24} color="#5856D6" />
            </View>
            <Text style={styles.actionText}>Adjust Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderTransactions = () => (
    <View style={styles.tabContent}>
      {/* Search and Filter */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Type Filters */}
      <View style={styles.filters}>
        {["", "payment", "refund", "withdrawal", "deposit"].map((type) => (
          <TouchableOpacity
            key={type || "all"}
            style={[styles.filterButton, typeFilter === type && styles.filterButtonActive]}
            onPress={() => setTypeFilter(type)}
          >
            <Text style={[styles.filterText, typeFilter === type && styles.filterTextActive]}>
              {type ? type.charAt(0).toUpperCase() + type.slice(1) : "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionList}>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        ) : (
          transactions.map((transaction) => {
            const typeConfig = transactionColors[transaction.type] || transactionColors.payment;
            const statusConfig = statusColors[transaction.status] || statusColors.pending;
            
            return (
              <View key={transaction._id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionType}>
                    <View
                      style={[
                        styles.typeIcon,
                        { backgroundColor: typeConfig.bg },
                      ]}
                    >
                      <Ionicons
                        name={
                          transaction.type === "payment"
                            ? "card"
                            : transaction.type === "refund"
                            ? "return-up-back"
                            : transaction.type === "withdrawal"
                            ? "arrow-up"
                            : transaction.type === "deposit"
                            ? "arrow-down"
                            : "create"
                        }
                        size={16}
                        color={typeConfig.text}
                      />
                    </View>
                    <View>
                      <Text style={styles.typeText}>
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig.bg },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionBody}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{transaction.user?.name}</Text>
                    <Text style={styles.userEmail}>{transaction.user?.email}</Text>
                  </View>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color:
                          transaction.type === "refund" || transaction.type === "withdrawal"
                            ? "#FF3B30"
                            : "#34C759",
                      },
                    ]}
                  >
                    {transaction.type === "refund" || transaction.type === "withdrawal"
                      ? "-"
                      : "+"}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>

                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "overview" && styles.tabButtonActive]}
          onPress={() => setActiveTab("overview")}
        >
          <Ionicons
            name="pie-chart-outline"
            size={20}
            color={activeTab === "overview" ? "#E75480" : "#666"}
          />
          <Text style={[styles.tabText, activeTab === "overview" && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "transactions" && styles.tabButtonActive]}
          onPress={() => setActiveTab("transactions")}
        >
          <Ionicons
            name="list-outline"
            size={20}
            color={activeTab === "transactions" ? "#E75480" : "#666"}
          />
          <Text style={[styles.tabText, activeTab === "transactions" && styles.tabTextActive]}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && activeTab === "overview" ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E75480" />
          <Text style={styles.loadingText}>Loading financial data...</Text>
        </View>
      ) : (
        <>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "transactions" && renderTransactions()}
        </>
      )}

      {/* Wallet Adjustment Modal */}
      <Modal visible={adjustModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjust Wallet Balance</Text>
            <Text style={styles.modalSubtitle}>
              Add or deduct funds from a user's wallet
            </Text>

            <TextInput
              style={styles.input}
              placeholder="User ID"
              value={adjustForm.userId}
              onChangeText={(text) => setAdjustForm({ ...adjustForm, userId: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (use negative for deduction)"
              keyboardType="decimal-pad"
              value={adjustForm.amount}
              onChangeText={(text) => setAdjustForm({ ...adjustForm, amount: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Reason for adjustment"
              multiline
              numberOfLines={3}
              value={adjustForm.reason}
              onChangeText={(text) => setAdjustForm({ ...adjustForm, reason: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setAdjustModalVisible(false);
                  setAdjustForm({ userId: "", amount: "", reason: "" });
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleAdjustWallet}
              >
                <Text style={styles.saveBtnText}>Adjust</Text>
              </TouchableOpacity>
            </View>
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
  tabNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#E75480",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#E75480",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    flex: 1,
    minWidth: (width - 50) / 2,
    borderLeftWidth: 4,
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateRangeButtons: {
    flexDirection: "row",
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    marginLeft: 8,
  },
  rangeButtonActive: {
    backgroundColor: "#E75480",
  },
  rangeButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  rangeButtonTextActive: {
    color: "#FFFFFF",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  simpleChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 180,
    paddingTop: 20,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: "center",
  },
  chartBarWrapper: {
    width: "60%",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 150,
  },
  chartBar: {
    width: "100%",
    backgroundColor: "#E75480",
    borderRadius: 4,
    minHeight: 10,
  },
  chartLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
  },
  chartValue: {
    fontSize: 9,
    color: "#999",
    marginTop: 2,
  },
  chartPlaceholder: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholderText: {
    marginTop: 10,
    color: "#999",
  },
  revenueSummary: {
    marginTop: 15,
    backgroundColor: "#34C75920",
    borderRadius: 12,
    padding: 15,
  },
  revenueItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  revenueAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingBottom: 10,
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
  filters: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  filterButtonActive: {
    backgroundColor: "#E75480",
    borderColor: "#E75480",
  },
  filterText: {
    fontSize: 12,
    color: "#666",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 15,
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
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionType: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  transactionBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: "#F5F5F5",
  },
  cancelBtnText: {
    color: "#666",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#E75480",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
