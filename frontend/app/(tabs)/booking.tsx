import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";

export default function BookingScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, updateActivity } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("https://gloweazy-backend.onrender.com/bookings/me/CLIENT_ID");
        setBookings(res.data);
        await updateActivity();
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await axios.patch(`https://gloweazy-backend.onrender.com/bookings/${bookingId}`, {
        status: newStatus,
      });

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );

      await updateActivity();

      Toast.show({
        type: "success",
        text1: "Booking updated",
        text2: `Status changed to ${newStatus} ✅`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: err?.message ?? "Could not update booking status ❌",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading your bookings...</Text>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No bookings yet. Start by finding a stylist!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.stylist.name}</Text>
          <Text style={styles.service}>Service: {item.service}</Text>
          <Text style={styles.date}>Date: {item.date}</Text>
          <Text style={styles.time}>Time: {item.time}</Text>
          <Text style={styles.status}>Status: {item.status}</Text>

          {/* Common actions */}
          <Button
            title="View Stylist"
            onPress={() =>
              router.push({
                pathname: "/stylist/[id]",
                params: { id: item.stylist._id },
              })
            }
          />
          <Button
            title="Rebook"
            onPress={async () => {
              router.push({
                pathname: "/book/[id]",
                params: { id: item.stylist._id },
              });
              await updateActivity();
            }}
          />

          {/* Client actions */}
          {user?.role === "client" && item.status === "confirmed" && (
            <>
              <Button
                title="Mark Satisfied"
                color="green"
                onPress={() => handleStatusChange(item._id, "satisfied")}
              />
              <Button
                title="Raise Dispute"
                color="red"
                onPress={() => handleStatusChange(item._id, "disputed")}
              />
            </>
          )}

          {/* Stylist actions */}
          {user?.role === "stylist" && item.status === "satisfied" && (
            <Button
              title="Mark as Completed"
              color="green"
              onPress={() => handleStatusChange(item._id, "completed")}
            />
          )}

          {/* Dispute state */}
          {item.status === "disputed" && (
            <Text style={{ color: "red", marginTop: 8 }}>
              ⚠️ This booking is under dispute. Stylist cannot mark completed until resolved.
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  service: { fontSize: 16, marginTop: 5 },
  date: { fontSize: 16, marginTop: 5 },
  time: { fontSize: 16, marginTop: 5 },
  status: { fontSize: 14, marginTop: 5, fontStyle: "italic" },
});
