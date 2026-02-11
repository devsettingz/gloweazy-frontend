import { useLocalSearchParams } from "expo-router";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import api from "../../utils/apiClient";

export default function Checkout() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleBuy = async (method: string) => {
    try {
      const res = await api.post(`/store/${id}/buy`, { method });
      if (res.data.success) {
        Alert.alert("✅ Purchase successful!", `Transaction ID: ${res.data.transaction._id}`);
      } else {
        Alert.alert("❌ Purchase failed", res.data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      Alert.alert("❌ Error", "Failed to complete purchase");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Purchase</Text>
      <Button title="Pay with Wallet" onPress={() => handleBuy("wallet")} />
      <Button title="Pay with Card" onPress={() => handleBuy("card")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
