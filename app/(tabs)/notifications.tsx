import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StyleSheet } from 'react-native';

export default function NotificationsScreen() {
  return (
    <ThemedView style={styles.container}>
      <IconSymbol name="bell.fill" size={64} color="#007AFF" style={styles.icon} />
      <ThemedText type="title">Notifications</ThemedText>
      <ThemedText>
        This is your notifications screen. You can display alerts, messages, or activity updates here.
      </ThemedText>
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
