import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function BookingsScreen() {
  const router = useRouter();
  const go = (path: string) => router.push(path as any);

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [stylist, setStylist] = useState('');
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [service, setService] = useState('');

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('https://gloweazy-backend.onrender.com/bookings');
        setBookings(res.data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Create booking
  const handleCreateBooking = async () => {
    try {
      const res = await axios.post('https://gloweazy-backend.onrender.com/bookings', {
        stylist,
        client,
        date,
        service
      });
      Alert.alert('Success', res.data.message);
      setBookings([...bookings, res.data.booking]); // update list
      setStylist('');
      setClient('');
      setDate('');
      setService('');
    } catch (err: any) {
      Alert.alert('Error', String(err?.response?.data?.message || 'Booking failed'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Bookings 📅</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : bookings.length === 0 ? (
        <Text style={styles.subtitle}>No bookings yet</Text>
      ) : (
        bookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.cardText}>Stylist: {b.stylist}</Text>
            <Text style={styles.cardText}>Client: {b.client}</Text>
            <Text style={styles.cardText}>Date: {b.date}</Text>
            <Text style={styles.cardText}>Service: {b.service}</Text>
          </View>
        ))
      )}

      <Text style={styles.formTitle}>Create New Booking</Text>
      <TextInput
        style={styles.input}
        placeholder="Stylist Name"
        placeholderTextColor="#aaa"
        value={stylist}
        onChangeText={setStylist}
      />
      <TextInput
        style={styles.input}
        placeholder="Client Name"
        placeholderTextColor="#aaa"
        value={client}
        onChangeText={setClient}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Service"
        placeholderTextColor="#aaa"
        value={service}
        onChangeText={setService}
      />
      <Button title="Book Appointment" onPress={handleCreateBooking} />

      <View style={styles.buttons}>
        <Button title="Edit Profile" onPress={() => go('/profile-setup')} />
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
  formTitle: { fontSize: 20, color: 'white', marginTop: 30, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: '#222'
  },
  buttons: { marginTop: 20, gap: 15 }
});
