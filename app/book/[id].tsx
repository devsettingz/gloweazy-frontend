// app/book/[id].tsx
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Stylist = {
  id: string;
  name: string;
  services: { name: string; price: number }[]; // ✅ include price for checkout
};

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // ✅ typed param
  const router = useRouter();
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [selectedService, setSelectedService] = useState<{ name: string; price: number } | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchStylist = async () => {
      try {
        const res = await axios.get(
          `https://gloweazy-backend.onrender.com/stylists/${id}`
        );
        const data = res.data.stylist ?? res.data;
        setStylist(data);
      } catch (err) {
        console.error("Error fetching stylist:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStylist();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedService) return;

    try {
      const res = await axios.post(`https://gloweazy-backend.onrender.com/bookings`, {
        stylistId: id,
        service: selectedService.name,
        date,
        time,
        price: selectedService.price,
      });

      const booking = res.data.booking ?? res.data;

      // ✅ Redirect to checkout with bookingId + amount
      router.replace({
        pathname: "/checkout",
        params: {
          bookingId: String(booking.id),
          amount: String(selectedService.price),
        },
      });
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading booking form...</Text>
      </View>
    );
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
      <Text style={styles.title}>Book with {stylist.name}</Text>

      <Text style={styles.section}>Select Service:</Text>
      {stylist.services?.map((service) => (
        <Button
          key={service.name}
          title={`${service.name} — GHS ${service.price}`}
          onPress={() => setSelectedService(service)}
          color={selectedService?.name === service.name ? "green" : "gray"}
        />
      ))}

      <Text style={styles.section}>Choose Date:</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.section}>Choose Time:</Text>
      <TextInput
        style={styles.input}
        placeholder="HH:MM"
        value={time}
        onChangeText={setTime}
      />

      <Button
        title="Confirm Booking"
        onPress={handleBooking}
        disabled={!selectedService || !date || !time}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  section: { fontSize: 18, fontWeight: "600", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
});
