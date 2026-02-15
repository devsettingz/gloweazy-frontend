import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LoadingOverlay from "../components/LoadingOverlay";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { confirmTopup, topupWallet } from "../utils/api";
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, RADIUS, GRADIENTS } from "../constants/luxuryTheme";

export default function WalletScreen() {
  const { user } = useAuth();
  const { balance, transactions, refresh, loading: walletLoading } = useWallet();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"card" | "mobile_money">("card");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTopup, setShowTopup] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Initial fetch
    refresh();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleTopup = async () => {
    if (!user?.id) {
      Alert.alert("Not logged in", "Please log in to top up your wallet");
      return;
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (amt < 5) {
      Alert.alert("Minimum Amount", "Minimum top-up amount is GHS 5");
      return;
    }

    try {
      setLoading(true);
      const init = await topupWallet({ userId: user.id, amount: amt, method });

      // For now, simulate payment confirmation (in production, this would be a webhook)
      const reference = init.reference ?? `TOPUP_${Date.now()}`;
      
      // Wait a moment then confirm
      setTimeout(async () => {
        try {
          await confirmTopup({ userId: user.id, reference });
          await refresh();
          setAmount("");
          setShowTopup(false);
          Alert.alert(
            "Top-up Successful!",
            `GHS ${amt} has been added to your wallet`,
            [{ text: "Great!", onPress: () => {} }]
          );
        } catch (err) {
          console.error("Confirm topup error:", err);
        }
      }, 1500);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Top-up failed";
      Alert.alert("Top-up Failed", errorMsg);
      setLoading(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
        return "arrow-down-circle";
      case "debit":
        return "arrow-up-circle";
      case "escrow":
        return "lock-closed";
      default:
        return "swap-horizontal";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
        return COLORS.success;
      case "debit":
        return COLORS.error;
      case "escrow":
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.txCard}
      onPress={() => router.push(`/wallet/${item.id}`)}
    >
      <View style={styles.txLeft}>
        <View style={[styles.txIcon, { backgroundColor: getTransactionColor(item.type) + "20" }]}>
          <Ionicons
            name={getTransactionIcon(item.type)}
            size={20}
            color={getTransactionColor(item.type)}
          />
        </View>
        <View>
          <Text style={styles.txTitle}>
            {item.description || item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={styles.txDate}>
            {new Date(item.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text
          style={[
            styles.txAmount,
            { color: getTransactionColor(item.type) },
          ]}
        >
          {item.type === "credit" ? "+" : item.type === "debit" ? "-" : ""} GHS{" "}
          {item.amount.toFixed(2)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "completed"
                  ? COLORS.success + "20"
                  : item.status === "pending"
                  ? COLORS.warning + "20"
                  : COLORS.error + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "completed"
                    ? COLORS.success
                    : item.status === "pending"
                    ? COLORS.warning
                    : COLORS.error,
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay message="Processing payment..." />}

      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <LinearGradient colors={GRADIENTS.gold} style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
              <Ionicons
                name="refresh"
                size={20}
                color={COLORS.ivory}
                style={refreshing ? styles.rotating : undefined}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            GHS {balance?.toFixed(2) || "0.00"}
          </Text>
          <View style={styles.balanceFooter}>
            <Ionicons name="wallet" size={16} color={COLORS.ivory} />
            <Text style={styles.balanceCurrency}>GlowEazy Wallet</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View
        style={[
          styles.actionsRow,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowTopup(!showTopup)}
        >
          <LinearGradient colors={GRADIENTS.gold} style={styles.actionIcon}>
            <Ionicons name="add" size={24} color={COLORS.ivory} />
          </LinearGradient>
          <Text style={styles.actionText}>Top Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert("Coming Soon", "Withdraw feature coming soon")}
        >
          <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="arrow-down" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/wallet/history")}
        >
          <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Top-up Section */}
      {showTopup && (
        <Animated.View style={styles.topupSection}>
          <View style={styles.topupCard}>
            <Text style={styles.topupTitle}>Add Money</Text>

            {/* Quick Amounts */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmountBtn,
                    Number(amount) === amt && styles.quickAmountBtnActive,
                  ]}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      Number(amount) === amt && styles.quickAmountTextActive,
                    ]}
                  >
                    GHS {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount */}
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>GHS</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Payment Method */}
            <Text style={styles.methodLabel}>Payment Method</Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  method === "card" && styles.methodBtnActive,
                ]}
                onPress={() => setMethod("card")}
              >
                <Ionicons
                  name="card"
                  size={20}
                  color={method === "card" ? COLORS.ivory : COLORS.charcoal}
                />
                <Text
                  style={[
                    styles.methodText,
                    method === "card" && styles.methodTextActive,
                  ]}
                >
                  Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  method === "mobile_money" && styles.methodBtnActive,
                ]}
                onPress={() => setMethod("mobile_money")}
              >
                <Ionicons
                  name="phone-portrait"
                  size={20}
                  color={method === "mobile_money" ? COLORS.ivory : COLORS.charcoal}
                />
                <Text
                  style={[
                    styles.methodText,
                    method === "mobile_money" && styles.methodTextActive,
                  ]}
                >
                  Mobile Money
                </Text>
              </TouchableOpacity>
            </View>

            {/* Top-up Button */}
            <TouchableOpacity
              style={[styles.topupBtn, !amount && styles.topupBtnDisabled]}
              onPress={handleTopup}
              disabled={!amount || loading}
            >
              <LinearGradient
                colors={amount ? GRADIENTS.gold : ["#E0E0E0", "#D0D0D0"]}
                style={styles.topupBtnGradient}
              >
                <Text
                  style={[
                    styles.topupBtnText,
                    !amount && styles.topupBtnTextDisabled,
                  ]}
                >
                  Top Up Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Transactions */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={transactions.slice(0, 20)}
          keyExtractor={(t) => t.id}
          renderItem={renderTransaction}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          }
          contentContainerStyle={styles.transactionsList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  balanceCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.soft,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.ivory,
    opacity: 0.9,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "700",
    color: COLORS.ivory,
    marginBottom: SPACING.sm,
  },
  balanceFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  balanceCurrency: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.ivory,
    opacity: 0.9,
  },
  rotating: {
    transform: [{ rotate: "360deg" }],
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.soft,
  },
  actionText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.charcoal,
    fontWeight: "500",
  },
  topupSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  topupCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.soft,
  },
  topupTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: "600",
    color: COLORS.charcoal,
    marginBottom: SPACING.md,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  quickAmountBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: "600",
    color: COLORS.charcoal,
  },
  quickAmountTextActive: {
    color: COLORS.ivory,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  currencySymbol: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: "600",
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: SPACING.lg,
    fontSize: TYPOGRAPHY.h3,
    color: COLORS.charcoal,
  },
  methodLabel: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: "600",
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  methodRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  methodBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  methodBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: "500",
    color: COLORS.charcoal,
  },
  methodTextActive: {
    color: COLORS.ivory,
  },
  topupBtn: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.soft,
  },
  topupBtnDisabled: {
    shadowOpacity: 0,
  },
  topupBtnGradient: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
  },
  topupBtnText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: "600",
    color: COLORS.ivory,
    letterSpacing: 0.5,
  },
  topupBtnTextDisabled: {
    color: COLORS.textMuted,
  },
  transactionsSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: "600",
    color: COLORS.charcoal,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  transactionsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.ivory,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  txTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  txDate: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
