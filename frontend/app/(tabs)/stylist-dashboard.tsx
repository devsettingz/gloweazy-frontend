import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StylistDashboard() {
  const router = useRouter();
  const go = (path: string) => router.push(path as any);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stylist Dashboard 💇🏽‍♀️</Text>
      <Text style={styles.subtitle}>Manage your bookings, clients, and business profile here.</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => go('/bookings')}>
          <Text style={styles.buttonText}>View Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => go('/profile-setup')}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={() => go('/login')}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2C2C2C', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8E8E93', marginBottom: 30, textAlign: 'center' },
  buttons: { width: '100%', gap: 15 },
  buttonPrimary: {
    backgroundColor: '#2C2C2C', // charcoal for stylist actions
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: '#F5D06F', // gold accent for logout
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
