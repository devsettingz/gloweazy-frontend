import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import { useAuth } from "../context/AuthContext"; // ✅ import AuthContext
import { useWallet } from "../context/WalletContext";
import { confirmTopup, topupWallet, WalletTransaction } from "../utils/api";
import { showError, showInfo, showSuccess } from "../utils/toast";

export default function WalletScreen() {
  const { user, updateActivity } = useAuth(); // ✅ use updateActivity
  const { balance, currency, transactions, refresh } = useWallet();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"card" | "mobile_money">("card");
  const [loading, setLoading] = useState(false);

  const handleTopup = async () => {
    if (!user?.id) return Alert.alert("Not logged in");
    const amt = Number(amount);
    if (!amt || amt <= 0) return Alert.alert("Enter a valid amount");

    try {
      setLoading(true);
      const init = await topupWallet({ userId: user.id, amount: amt, method });

      if (init.authorizationUrl) {
        showInfo("Complete payment via gateway instructions");
      }

      const reference = init.reference ?? "SIMULATED_REFERENCE";
      await confirmTopup({ userId: user.id, reference });
      await refresh();
      await updateActivity(); // ✅ update activity after top-up
      setAmount("");
      showSuccess(`Wallet topped up! New balance: ${balance + amt} ${currency}`);
    } catch (err: any) {
      showError(err?.message ?? "Top-up failed, please try again ❌");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: WalletTransaction }) => (
    <TouchableOpacity
      style={styles.txRow}
      onPress={async () => {
        router.push(`/wallet/${item.id}`);
        await updateActivity(); // ✅ update activity when viewing transaction
      }}
    >
      <Text style={styles.txType}>{item.type.toUpperCase()}</Text>
      <Text style={styles.txAmount}>
        {item.type === "credit" ? "+" : "-"} {item.amount} {item.currency}
      </Text>
      <Text style={styles.txMeta}>
        {item.method} • {new Date(item.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay message="Processing top-up..." />}

      <Text style={styles.title}>Wallet</Text>
      <Text style={styles.balance}>
        {balance} {currency}
      </Text>

      <View style={styles.topupBox}>
        <TextInput
          placeholder="Amount (GHS)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
        />
        <View style={styles.methodRow}>
          <Button
            title={`Method: ${method === "card" ? "Card" : "Mobile Money"}`}
            onPress={() =>
              setMethod(method === "card" ? "mobile_money" : "card")
            }
          />
        </View>
        <Button title="Top up" onPress={handleTopup} disabled={loading} />
      </View>

      <Text style={styles.section}>Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: "#2C2C2C" },
  balance: { fontSize: 22, fontWeight: "600", marginBottom: 16, color: "#E75480" },
  topupBox: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  methodRow: { marginBottom: 10 },
  section: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
  txRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  txType: { fontWeight: "700", color: "#2C2C2C" },
  txAmount: { color: "#2C2C2C" },
  txMeta: { color: "#8E8E93", fontSize: 12 },
  empty: { color: "#8E8E93" },
});
