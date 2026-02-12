import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import { useAuth } from "../context/AuthContext";
import { checkoutPayment } from "../utils/api";
import { showError, showSuccess } from "../utils/toast";

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user?.id) return showError("Not logged in");

    try {
      setLoading(true);
      const res = await checkoutPayment({
        bookingId: "demo-booking-id", // Replace with actual booking ID
        method: "card", // or "mobile_money" or "cash"
        amount: 100, // Replace with actual amount
      });

      if (res?.status === "success") {
        showSuccess("Payment successful ✅");
      } else {
        showError("Payment failed ❌");
      }
    } catch (err: any) {
      showError(err?.message ?? "Payment error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay message="Processing payment..." />}
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Confirm your booking payment</Text>
      <Button title="Pay Now" onPress={handleCheckout} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: "#2C2C2C" },
  subtitle: { fontSize: 16, marginBottom: 16, color: "#8E8E93" },
});
