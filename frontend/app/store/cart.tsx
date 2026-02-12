import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import api from "../../utils/apiClient";

export default function Cart() {
  const { product } = useLocalSearchParams<{ product?: string }>();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (product) {
      try {
        const parsed = JSON.parse(product);
        setCartItems((prev) => [...prev, parsed]);
      } catch (err) {
        console.error("Error parsing product:", err);
      }
    }
  }, [product]);

  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const res = await api.post(`/store/${item._id}/buy`, { method: "wallet" });
        if (!res.data.success) {
          Alert.alert("❌ Failed to purchase", item.name);
          return;
        }
      }
      Alert.alert("✅ Checkout successful!", "All items purchased.");
      setCartItems([]);
    } catch (err) {
      console.error("Cart checkout error:", err);
      Alert.alert("❌ Error", "Failed to complete checkout");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart 🛒</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price} {item.currency}</Text>
              </View>
            )}
          />
          <Button title="Checkout All" onPress={handleCheckout} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  empty: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 20 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  name: { fontSize: 18, fontWeight: "600" },
  price: { fontSize: 16, color: "#333" },
});
