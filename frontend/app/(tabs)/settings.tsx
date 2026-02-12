/**
 * Settings Screen - Luxury Edition
 * Professional settings with elegant design
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, RADIUS, GRADIENTS } from '../../constants/luxuryTheme';

type SettingItem = {
  icon: string;
  title: string;
  subtitle?: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const accountSettings: SettingItem[] = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      type: 'navigate',
      onPress: () => router.push('/(tabs)/profile-setup'),
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      type: 'navigate',
      onPress: () => {},
    },
    {
      icon: 'location-outline',
      title: 'Addresses',
      subtitle: 'Manage your saved locations',
      type: 'navigate',
      onPress: () => {},
    },
  ];

  const appSettings: SettingItem[] = [
    {
      icon: 'notifications-outline',
      title: 'Push Notifications',
      subtitle: 'Receive booking updates & offers',
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      icon: 'moon-outline',
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      type: 'toggle',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      icon: 'navigate-outline',
      title: 'Location Services',
      subtitle: 'Allow location for nearby stylists',
      type: 'toggle',
      value: locationServices,
      onToggle: setLocationServices,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      icon: 'help-circle-outline',
      title: 'Help Center',
      subtitle: 'FAQs and support articles',
      type: 'navigate',
      onPress: () => {},
    },
    {
      icon: 'chatbubble-outline',
      title: 'Contact Support',
      subtitle: 'Get in touch with our team',
      type: 'navigate',
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of Service',
      type: 'navigate',
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Privacy Policy',
      type: 'navigate',
      onPress: () => {},
    },
  ];

  const dangerSettings: SettingItem[] = [
    {
      icon: 'log-out-outline',
      title: 'Sign Out',
      type: 'action',
      danger: true,
      onPress: handleLogout,
    },
    {
      icon: 'trash-outline',
      title: 'Delete Account',
      subtitle: 'Permanently remove your account',
      type: 'action',
      danger: true,
      onPress: () => Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?'),
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number, total: number) => (
    <TouchableOpacity
      key={item.title}
      style={[
        styles.settingItem,
        index === 0 && styles.settingItemFirst,
        index === total - 1 && styles.settingItemLast,
      ]}
      onPress={item.onPress}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, item.danger && styles.iconContainerDanger]}>
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.danger ? COLORS.error : COLORS.primary}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, item.danger && styles.settingTitleDanger]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      {item.type === 'toggle' && item.onToggle && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E5EA', true: COLORS.primaryLight }}
          thumbColor={item.value ? COLORS.primary : '#fff'}
        />
      )}
      
      {item.type === 'navigate' && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => renderSettingItem(item, index, items.length))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={GRADIENTS.light} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <LinearGradient colors={GRADIENTS.dark} style={styles.profileGradient}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{user?.name?.[0] || 'G'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'guest@example.com'}</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>
                {(user?.role || 'client').toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(tabs)/profile-setup')}>
            <Ionicons name="pencil" size={16} color={COLORS.ivory} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Settings Sections */}
      {renderSection('Account', accountSettings)}
      {renderSection('Preferences', appSettings)}
      {renderSection('Support', supportSettings)}
      {renderSection('', dangerSettings)}

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>GlowEazy v1.0.0</Text>
        <Text style={styles.versionSubtext}>Made with ✦ luxury in mind</Text>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.charcoal,
    fontFamily: TYPOGRAPHY.serif,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.ivory,
  },
  profileInitial: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.ivory,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.ivory,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.pearl,
    marginTop: 2,
  },
  profileBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  profileBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.ivory,
    letterSpacing: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.lg,
    ...SHADOWS.subtle,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  settingItemFirst: {
    borderTopWidth: 0,
  },
  settingItemLast: {
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconContainerDanger: {
    backgroundColor: '#FFEBEB',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  settingTitleDanger: {
    color: COLORS.error,
  },
  settingSubtitle: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  versionText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  versionSubtext: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginTop: 4,
  },
});
