import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // adjust path if needed

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const go = (path: string) => router.push(path as any);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {user?.role === 'stylist' ? 'Stylist' : 'Client'} 🚀</Text>
      <Text style={styles.subtitle}>
        This is your central hub for managing bookings, profiles, and more.
      </Text>

      <View style={styles.buttons}>
        {user?.role === 'client' && (
          <Button title="Explore Stylists" onPress={() => go('/explore')} />
        )}
        {user?.role === 'stylist' && (
          <Button title="My Bookings" onPress={() => go('/stylist-bookings')} />
        )}
        <Button title="Profile" onPress={() => go('/profile-setup')} />
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
