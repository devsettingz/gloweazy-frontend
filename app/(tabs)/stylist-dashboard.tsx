import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function StylistDashboard() {
  const router = useRouter();
  const go = (path: string) => router.push(path as any);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stylist Dashboard 💇🏽‍♀️</Text>
      <Text style={styles.subtitle}>Manage your bookings, clients, and business profile here.</Text>

      <View style={styles.buttons}>
        <Button title="View Bookings" onPress={() => go('/bookings')} />
        <Button title="Edit Profile" onPress={() => go('/profile-setup')} />
        <Button title="Logout" onPress={() => go('/login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 30, textAlign: 'center' },
  buttons: { width: '100%', gap: 15 }
});
