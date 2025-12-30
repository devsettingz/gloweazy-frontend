import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // ✅ fixed path
import { getBookings } from '../../utils/api'; // ✅ fixed path

export default function ClientBookingsScreen() {
  const router = useRouter();
  const go = (path: string) => router.push(path as any);

  const { user } = useAuth(); // logged-in user
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getBookings();
        // ✅ filter by logged-in client
        setBookings(data.filter((b: any) => b.client === user?.email));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Bookings 📅</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : bookings.length === 0 ? (
        <Text style={styles.subtitle}>You have no bookings yet</Text>
      ) : (
        bookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.cardText}>Stylist: {b.stylist}</Text>
            <Text style={styles.cardText}>Date: {b.date}</Text>
            <Text style={styles.cardText}>Service: {b.service}</Text>
            <Text style={styles.statusText}>
              Status: {b.status === 'pending' ? '⏳ Pending' : b.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
            </Text>
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
  statusText: { color: '#0f0', fontSize: 16, marginTop: 5 },
  buttons: { marginTop: 20, gap: 15 }
});
