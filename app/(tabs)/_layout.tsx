/**
 * Tab Layout - Simplified
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E75480',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F5D06F',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="client-bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size || 24} color={color} />
          ),
        }}
      />
      
      {/* Hide these from tab bar but keep available */}
      <Tabs.Screen
        name="notifications"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile-setup"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="bookings-tabs"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="stylist-bookings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="stylist-dashboard"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="client-dashboard"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="ForgotPassword"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="ResetPassword"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="NearbyStylists"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="booking"
        options={{ href: null }}
      />
    </Tabs>
  );
}
