import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import api from "../../utils/apiClient";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get(`/store/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error loading product:", err);
      }
    };
    loadProduct();
  }, [id]);

  if (!product) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {product.imageUrl && <Image source={{ uri: product.imageUrl }} style={styles.image} />}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.price}>{product.price} {product.currency}</Text>
      <Text style={styles.description}>{product.description}</Text>

      <Link href={{ pathname: "/store/checkout", params: { id: product._id } }}>
        <Button title="Buy Now" />
      </Link>
      <Link href={{ pathname: "/store/cart", params: { product: JSON.stringify(product) } }}>
        <Button title="Add to Cart" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  image: { width: "100%", height: 250, borderRadius: 8, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "bold" },
  category: { fontSize: 16, color: "#666", marginVertical: 4 },
  price: { fontSize: 20, color: "#333", marginVertical: 8 },
  description: { fontSize: 16, color: "#444", marginBottom: 16 },
});
