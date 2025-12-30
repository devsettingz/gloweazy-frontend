import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { approveBooking, rejectBooking } from '../../utils/api'; // ✅ fixed path

export default function StylistBookingsScreen() {
  const router = useRouter();
  const go = (path: string) => router.push(path as any);

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://gloweazy-backend.onrender.com/bookings/status/${filter}`);
        setBookings(res.data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [filter]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const updated = action === 'approve' ? await approveBooking(id) : await rejectBooking(id);
      setBookings(bookings.map(b => b.id === id ? updated : b));
      Alert.alert('Success', `Booking ${action}d`);
    } catch (err: any) {
      Alert.alert('Error', String(err?.response?.data?.message || 'Action failed'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage Bookings ✂️</Text>

      {/* Status Filter Tabs */}
      <View style={styles.tabs}>
        {['pending', 'approved', 'rejected'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.tab, filter === status && styles.activeTab]}
            onPress={() => setFilter(status as any)}
          >
            <Text style={styles.tabText}>{status.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : bookings.length === 0 ? (
        <Text style={styles.subtitle}>No {filter} bookings</Text>
      ) : (
        bookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.cardText}>Client: {b.client}</Text>
            <Text style={styles.cardText}>Date: {b.date}</Text>
            <Text style={styles.cardText}>Service: {b.service}</Text>
            <Text style={styles.cardText}>Status: {b.status}</Text>
            {b.status === 'pending' && (
              <View style={styles.actions}>
                <Button title="Approve" onPress={() => handleAction(b.id, 'approve')} />
                <Button title="Reject" onPress={() => handleAction(b.id, 'reject')} />
              </View>
            )}
          </View>
        ))
      )}

      <View style={styles.buttons}>
        <Button title="Profile" onPress={() => go('/profile-setup')} />
        <Button title="Logout" onPress={() => go('/login')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  title: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#222', padding: 15, borderRadius: 8, marginBottom: 15 },
  cardText: { color: 'white', fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  buttons: { marginTop: 20, gap: 15 },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tab: { padding: 10, borderRadius: 5, backgroundColor: '#333' },
  activeTab: { backgroundColor: '#555' },
  tabText: { color: 'white', fontWeight: 'bold' }
});
