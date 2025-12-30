import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login'); // back to login
  };

  return (
    <ThemedView style={styles.container}>
      <IconSymbol name="gearshape.fill" size={48} color="#007AFF" style={styles.icon} />
      <ThemedText type="title">Settings</ThemedText>
      <Button title="Logout" onPress={handleLogout} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    marginBottom: 12,
  },
});
