import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useWallet } from "../../context/WalletContext";
import api from "../../utils/api";
import { showError, showSuccess } from "../../utils/toast";

export default function TransactionReceipt() {
  const { txId } = useLocalSearchParams<{ txId: string }>();
  const { transactions } = useWallet();
  const [loading, setLoading] = useState(false);

  const tx = transactions.find((t) => t.id === txId);

  if (!tx) {
    return (
      <View style={styles.center}>
        <Text>Transaction not found.</Text>
      </View>
    );
  }

  const handleEmailReceipt = async () => {
    try {
      setLoading(true);
      await api.post(`/transactions/${tx.id}/email`);
      showSuccess("Receipt emailed — check your inbox 📩");
    } catch (err: any) {
      showError("Failed to send receipt email ❌");
      console.error("Email receipt error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/transactions/${tx.id}/pdf`);
      const pdfUrl = res.data.url;
      if (pdfUrl) {
        await WebBrowser.openBrowserAsync(pdfUrl);
      } else {
        showError("No PDF available ❌");
      }
    } catch (err: any) {
      showError("Failed to fetch PDF receipt ❌");
      console.error("PDF receipt error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay message="Processing receipt..." />}

      <Text style={styles.title}>Transaction Receipt</Text>
      <Text style={styles.item}>ID: {tx.id}</Text>
      <Text style={styles.item}>Type: {tx.type}</Text>
      <Text style={styles.item}>
        Amount: {tx.amount} {tx.currency}
      </Text>
      <Text style={styles.item}>Method: {tx.method}</Text>
      <Text style={styles.item}>
        Date: {new Date(tx.createdAt).toLocaleString()}
      </Text>
      {tx.reference && <Text style={styles.item}>Reference: {tx.reference}</Text>}
      {tx.note && <Text style={styles.item}>Note: {tx.note}</Text>}

      <View style={styles.actions}>
        <Button title="Email Receipt" onPress={handleEmailReceipt} />
        <Button title="Download PDF" onPress={handleDownloadPDF} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  item: { fontSize: 16, marginBottom: 8 },
  actions: { marginTop: 20, gap: 12 },
});
