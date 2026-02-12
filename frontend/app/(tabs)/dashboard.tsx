import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // ✅ correct path

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth(); // ✅ include logout

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome {user?.role === 'stylist' ? 'Stylist' : 'Client'} 🚀
      </Text>
      <Text style={styles.subtitle}>
        This is your central hub for managing bookings, profiles, and more.
      </Text>

      <View style={styles.buttons}>
        {user?.role === 'client' && (
          <Button title="Explore Stylists" onPress={() => router.push('/explore')} />
        )}
        {user?.role === 'stylist' && (
          <Button title="My Bookings" onPress={() => router.push('/stylist-bookings')} />
        )}
        <Button title="Profile" onPress={() => router.push('/profile-setup')} />
        <Button
          title="Logout"
          onPress={async () => {
            await logout(); // ✅ clear AsyncStorage + context
            router.replace('/login'); // ✅ redirect after logout
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 15,
  },
});
