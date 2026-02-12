// frontend/app/wallet.tsx
import { useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { confirmTopup, topupWallet, WalletTransaction } from "../utils/api";

export default function WalletScreen() {
  const { user } = useAuth();
  const { balance, currency, transactions, refresh } = useWallet();

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

      // Gateway step: either open authorizationUrl or use clientSecret
      if (init.authorizationUrl) {
        Toast.show({
          type: "info",
          text1: "Complete payment",
          text2: "Follow gateway instructions",
        });
      }

      // Simulate confirmation for now (replace with actual reference from gateway)
      const reference = init.reference ?? "SIMULATED_REFERENCE";
      await confirmTopup({ userId: user.id, reference });
      await refresh();
      setAmount("");
      Toast.show({
        type: "success",
        text1: "Wallet topped up",
        text2: `New balance: ${balance + amt} ${currency}`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Top-up failed",
        text2: String(err?.message ?? "Try again"),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: WalletTransaction }) => (
    <View style={styles.txRow}>
      <Text style={styles.txType}>{item.type.toUpperCase()}</Text>
      <Text style={styles.txAmount}>
        {item.type === "credit" ? "+" : "-"} {item.amount} {item.currency}
      </Text>
      <Text style={styles.txMeta}>
        {item.method} • {new Date(item.createdAt).toLocaleString()}
      </Text>
      {item.note ? <Text style={styles.txNote}>{item.note}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
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
        <Button
          title={loading ? "Processing..." : "Top up"}
          onPress={handleTopup}
          disabled={loading}
        />
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
  txRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  txType: { fontWeight: "700", color: "#2C2C2C" },
  txAmount: { color: "#2C2C2C" },
  txMeta: { color: "#8E8E93", fontSize: 12 },
  txNote: { color: "#555", fontSize: 12, marginTop: 4 },
  empty: { color: "#8E8E93" },
});
