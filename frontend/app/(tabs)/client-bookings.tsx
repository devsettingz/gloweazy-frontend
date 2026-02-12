import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ClientBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false); // ✅ spinner state

  const fetchBookings = async () => {
    try {
      const res = await axios.get('https://gloweazy-backend.onrender.com/bookings');
      setBookings(res.data.bookings);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error loading bookings',
        text2: 'Please try again ❌',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.date) > now);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return { backgroundColor: '#4CAF50' };
      case 'pending': return { backgroundColor: '#FFC107' };
      case 'rejected': return { backgroundColor: '#F44336' };
      default: return { backgroundColor: '#9E9E9E' };
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      setCancelLoading(true); // ✅ show spinner
      await axios.delete(`https://gloweazy-backend.onrender.com/bookings/${id}`);
      Toast.show({
        type: 'success',
        text1: 'Booking cancelled',
        text2: 'Your booking was cancelled successfully ✅',
      });
      fetchBookings(); // refresh list
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Cancellation failed',
        text2: 'Please try again ❌',
      });
      console.error(err);
    } finally {
      setCancelLoading(false); // ✅ hide spinner
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Upcoming Bookings 📅</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#E75480" />
      ) : upcomingBookings.length === 0 ? (
        <Text style={styles.subtitle}>No upcoming bookings</Text>
      ) : (
        upcomingBookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.cardTitle}>{b.service}</Text>
            <Text style={styles.cardText}>Stylist: {b.stylistName}</Text>
            <Text style={styles.cardText}>
              Date: {new Date(b.date).toLocaleDateString()} — {new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={[styles.badge, getStatusStyle(b.status)]}>
              <Text style={styles.badgeText}>{b.status.toUpperCase()}</Text>
            </View>

            {/* ✅ Cancel button triggers confirmation modal */}
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={() => {
                setSelectedBooking(b);
                setShowConfirm(true);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* ✅ Confirmation Modal */}
      <Modal visible={showConfirm} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Booking?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to cancel this booking?
            </Text>

            {cancelLoading ? (
              <ActivityIndicator size="large" color="#E75480" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Button
                  title="Yes, Cancel"
                  color="#F44336"
                  onPress={() => {
                    if (selectedBooking) cancelBooking(selectedBooking.id);
                    setShowConfirm(false);
                  }}
                />
                <Button title="No, Keep" onPress={() => setShowConfirm(false)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2C2C2C', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8E8E93', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#E75480', marginBottom: 8 },
  cardText: { color: '#2C2C2C', fontSize: 14, marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  buttonCancel: { backgroundColor: '#F44336', paddingVertical: 10, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
});
