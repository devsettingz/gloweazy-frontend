import { useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useWallet } from "../../context/WalletContext";
import { WalletTransaction } from "../../utils/api";

export default function WalletHistoryScreen() {
  const { transactions } = useWallet();

  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [filterMethod, setFilterMethod] = useState<"all" | "card" | "mobile_money">("all");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredTransactions = transactions.filter((t: WalletTransaction) => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesMethod = filterMethod === "all" || t.method === filterMethod;
    const matchesDate =
      !filterDate ||
      new Date(t.createdAt).toLocaleDateString().includes(filterDate);
    return matchesType && matchesMethod && matchesDate;
  });

  const renderItem = ({ item }: { item: WalletTransaction }) => (
    <View style={styles.txRow}>
      <Text style={styles.txType}>{item.type.toUpperCase()}</Text>
      <Text style={styles.txAmount}>
        {item.type === "credit" ? "+" : "-"} {item.amount} {item.currency}
      </Text>
      <Text style={styles.txMeta}>
        {item.method} • {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay message="Filtering transactions..." />}

      <Text style={styles.title}>Transaction History</Text>

      {/* Filters */}
      <View style={styles.filters}>
        <Button
          title={`Type: ${filterType}`}
          onPress={() =>
            setFilterType(
              filterType === "all"
                ? "credit"
                : filterType === "credit"
                ? "debit"
                : "all"
            )
          }
        />
        <Button
          title={`Method: ${filterMethod}`}
          onPress={() =>
            setFilterMethod(
              filterMethod === "all"
                ? "card"
                : filterMethod === "card"
                ? "mobile_money"
                : "all"
            )
          }
        />
        <TextInput
          placeholder="Filter by date (MM/DD/YYYY)"
          value={filterDate}
          onChangeText={setFilterDate}
          style={styles.input}
        />
      </View>

      {/* Transaction list */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No transactions found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#2C2C2C" },
  filters: { marginBottom: 16, gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  txRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  txType: { fontWeight: "700", color: "#2C2C2C" },
  txAmount: { color: "#2C2C2C" },
  txMeta: { color: "#8E8E93", fontSize: 12 },
  empty: { color: "#8E8E93", textAlign: "center", marginTop: 20 },
});
