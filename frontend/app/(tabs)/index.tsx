/**
 * Main App Home (inside tabs) - Luxury Edition
 * Elegant dashboard for logged-in users
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, RADIUS, GRADIENTS } from '../../constants/luxuryTheme';

export default function MainHomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const menuItems = [
    {
      icon: 'search',
      title: 'Discover Stylists',
      subtitle: 'Find top beauty professionals',
      route: '/(tabs)/explore',
      gradient: GRADIENTS.gold,
    },
    {
      icon: 'calendar',
      title: 'My Bookings',
      subtitle: 'View and manage appointments',
      route: '/(tabs)/client-bookings',
      gradient: ['#E8B4B8', '#D4A574'],
    },
    {
      icon: 'wallet',
      title: 'My Wallet',
      subtitle: 'Balance and transactions',
      route: '/wallet',
      gradient: ['#7A9E9E', '#5A8A8A'],
    },
    {
      icon: 'person',
      title: 'My Profile',
      subtitle: 'Edit your details',
      route: '/(tabs)/profile-setup',
      gradient: ['#9E7A9E', '#8A5A8A'],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={GRADIENTS.light} style={styles.background} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile-setup')}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.profileGradient}>
              <Text style={styles.profileInitial}>{user?.name?.[0] || 'G'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View
        style={[
          styles.statsContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>$0</Text>
          <Text style={styles.statLabel}>Wallet</Text>
        </View>
      </Animated.View>

      {/* Menu Grid */}
      <Animated.View
        style={[
          styles.menuContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={item.gradient} style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color={COLORS.ivory} />
              </LinearGradient>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Featured Banner */}
      <Animated.View
        style={[
          styles.bannerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <LinearGradient colors={GRADIENTS.dark} style={styles.banner}>
          <Text style={styles.bannerTitle}>Premium Experience</Text>
          <Text style={styles.bannerText}>
            Book luxury beauty services with the finest professionals in your area
          </Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.bannerButtonText}>Explore Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Logout */}
      <Animated.View
        style={[
          styles.logoutContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>

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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.charcoal,
    marginTop: 4,
    fontFamily: TYPOGRAPHY.serif,
  },
  profileButton: {
    borderRadius: RADIUS.full,
    ...SHADOWS.soft,
  },
  profileGradient: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.ivory,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.soft,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.primaryLight,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  menuContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: SPACING.lg,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  menuItem: {
    width: '47%',
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  bannerContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  banner: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '300',
    color: COLORS.ivory,
    marginBottom: SPACING.sm,
    fontFamily: TYPOGRAPHY.serif,
  },
  bannerText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.pearl,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  bannerButton: {
    backgroundColor: COLORS.ivory,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  logoutContainer: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.error,
    fontWeight: '500',
  },
});
