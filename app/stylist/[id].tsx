// frontend/app/stylist/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import LoadingOverlay from "../../components/LoadingOverlay";
import api from "../../utils/api";
import { showError } from "../../utils/toast";

type Stylist = {
  _id: string;
  name: string;
  services: string[];
  location?: { address?: string };
  bio?: string;
};

export default function StylistProfile() {
  const { id } = useLocalSearchParams(); // stylist ID from route
  const router = useRouter();
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStylist = async () => {
      try {
        const res = await api.get(`/stylists/${id}`);
        setStylist(res.data);
      } catch (err) {
        showError("Error fetching stylist profile ❌");
        console.error("Error fetching stylist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStylist();
  }, [id]);

  if (loading) {
    return <LoadingOverlay message="Loading stylist profile..." />;
  }

  if (!stylist) {
    return (
      <View style={styles.center}>
        <Text>Stylist not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{stylist.name}</Text>

      <Text style={styles.section}>Services:</Text>
      <Text style={styles.text}>{stylist.services?.join(", ") || "No services listed"}</Text>

      <Text style={styles.section}>Location:</Text>
      <Text style={styles.text}>
        {stylist.location?.address || "No address available"}
      </Text>

      <Text style={styles.section}>About:</Text>
      <Text style={styles.text}>{stylist.bio || "No bio provided."}</Text>

      <Button
        title="Book Appointment"
        onPress={() => router.push(`/book/${stylist._id}`)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  section: { fontSize: 18, fontWeight: "600", marginTop: 15 },
  text: { fontSize: 16, marginTop: 5 }
});
