import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function ClientDashboard() {
  const router = useRouter();
  const go = (path: string) => router.push(path as any);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client Dashboard 💅🏽</Text>
      <Text style={styles.subtitle}>Browse stylists, book appointments, and manage your profile.</Text>

      <View style={styles.buttons}>
        <Button title="Explore Stylists" onPress={() => go('/explore')} />
        <Button title="My Bookings" onPress={() => go('/bookings')} />
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
