/**
 * Bookings Tabs - Simplified version without material-top-tabs
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BookingScreen from './booking';
import ClientBookingsScreen from './client-bookings';
import StylistBookingsScreen from './stylist-bookings';

type TabType = 'stylist' | 'client' | 'booking';

export default function BookingsTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('stylist');

  const renderContent = () => {
    switch (activeTab) {
      case 'stylist':
        return <StylistBookingsScreen />;
      case 'client':
        return <ClientBookingsScreen />;
      case 'booking':
        return <BookingScreen />;
      default:
        return <StylistBookingsScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stylist' && styles.activeTab]}
          onPress={() => setActiveTab('stylist')}
        >
          <Text style={[styles.tabText, activeTab === 'stylist' && styles.activeTabText]}>
            Stylist
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'client' && styles.activeTab]}
          onPress={() => setActiveTab('client')}
        >
          <Text style={[styles.tabText, activeTab === 'client' && styles.activeTabText]}>
            Client
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'booking' && styles.activeTab]}
          onPress={() => setActiveTab('booking')}
        >
          <Text style={[styles.tabText, activeTab === 'booking' && styles.activeTabText]}>
            Booking
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E75480',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#E75480',
  },
  content: {
    flex: 1,
  },
});
