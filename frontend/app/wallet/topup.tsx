import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { confirmTopup, topupWallet } from "../../utils/api";
import { showError, showInfo, showSuccess } from "../../utils/toast";

export default function WalletTopupScreen() {
  const { user } = useAuth();
  const { balance, currency, refresh } = useWallet();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"card" | "mobile_money">("card");
  const [loading, setLoading] = useState(false);

  const handleTopup = async () => {
    if (!user?.id) return showError("Not logged in");
    const amt = Number(amount);
    if (!amt || amt <= 0) return showError("Enter a valid amount");

    try {
      setLoading(true);
      const init = await topupWallet({ userId: user.id, amount: amt, method });

      if (init.authorizationUrl) {
        showInfo("Complete payment via gateway instructions");
      }

      const reference = init.reference ?? "SIMULATED_REFERENCE";
      await confirmTopup({ userId: user.id, reference });
      await refresh();
      setAmount("");
      showSuccess(`Wallet topped up! New balance: ${balance + amt} ${currency}`);
    } catch (err: any) {
      showError(err?.message ?? "Top-up failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay message="Processing top-up..." />}
      <Text style={styles.title}>Top Up Wallet</Text>
      <Text style={styles.balance}>
        Current Balance: {balance} {currency}
      </Text>

      <TextInput
        placeholder="Amount (GHS)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <Button
        title={`Method: ${method === "card" ? "Card" : "Mobile Money"}`}
        onPress={() => setMethod(method === "card" ? "mobile_money" : "card")}
      />

      <Button title="Top up" onPress={handleTopup} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: "#2C2C2C" },
  balance: { fontSize: 18, fontWeight: "600", marginBottom: 16, color: "#E75480" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
