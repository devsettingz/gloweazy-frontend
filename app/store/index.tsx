import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../utils/apiClient";

export default function StoreHome() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/store");
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };
    loadProducts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gloweazy Store 🛍️</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/store/[id]", params: { id: item._id } }}>
            <TouchableOpacity style={styles.card}>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price} {item.currency}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: { marginBottom: 16, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
  image: { width: "100%", height: 150, borderRadius: 8 },
  name: { fontSize: 18, fontWeight: "600", marginTop: 8 },
  price: { fontSize: 16, color: "#333", marginTop: 4 },
});
