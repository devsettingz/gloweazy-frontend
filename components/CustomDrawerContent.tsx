/**
 * Custom Drawer Content - Simplified (not currently used)
 * Keeping for reference if drawer is re-added later
 */

import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

// ✅ Helper to format timestamps nicely
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString()}`;
  return date.toLocaleString();
};

export default function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          Toast.show({
            type: 'success',
            text1: 'Logged out',
            text2: 'You have been logged out successfully ✅',
          });
        },
      },
    ]);
  };

  const handleSwitchAccount = () => {
    Alert.alert("Switch Account", "Do you want to log out and switch accounts?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Switch",
        style: "default",
        onPress: async () => {
          await logout();
          Toast.show({
            type: 'info',
            text1: 'Switch Account',
            text2: 'You can now log in with another account 🔄',
          });
        },
      },
    ]);
  };

  return (
    <ScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* ✅ Header section */}
      <View style={styles.header}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <Image source={require('../assets/gloweazy-logo.png')} style={styles.avatar} />
        )}
        <Text style={styles.name}>{user?.name ?? 'Guest User'}</Text>

        {/* ✅ Role badge */}
        {user?.role && (
          <View style={[styles.roleBadge, user.role === 'stylist' ? styles.stylist : styles.client]}>
            <Text style={styles.roleText}>
              {user.role === 'stylist' ? 'Stylist' : 'Client'}
            </Text>
          </View>
        )}

        {/* ✅ Dynamic greeting */}
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.name ?? 'Guest'}
        </Text>

        {/* ✅ Last login */}
        {user?.lastLogin && (
          <Text style={styles.lastLogin}>
            Last login: {formatRelativeTime(user.lastLogin)}
          </Text>
        )}

        {/* ✅ Last activity */}
        {user?.lastActivity && (
          <Text style={styles.lastActivity}>
            Last activity: {formatRelativeTime(user.lastActivity)}
          </Text>
        )}

        <Text style={styles.subtitle}>Welcome to Gloweazy ✨</Text>
      </View>

      {/* ✅ Drawer items - simplified without DrawerItemList */}
      <View style={styles.drawerItems}>
        <Text style={styles.note}>Drawer navigation items would appear here</Text>
      </View>

      {/* ✅ Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#E75480" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchAccount}>
          <Ionicons name="swap-horizontal-outline" size={22} color="#2C2C2C" />
          <Text style={styles.switchText}>Switch Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: '700', color: '#2C2C2C' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  greeting: { fontSize: 14, fontWeight: '600', color: '#E75480', marginTop: 6 },
  lastLogin: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  lastActivity: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  stylist: { backgroundColor: '#E75480' },
  client: { backgroundColor: '#2C2C2C' },
  drawerItems: {
    flex: 1,
    padding: 20,
  },
  note: {
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
  },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logoutText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#E75480' },
  switchBtn: { flexDirection: 'row', alignItems: 'center' },
  switchText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#2C2C2C' },
});
