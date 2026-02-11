/**
 * Wallet Tabs - Simplified version without material-top-tabs
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import WalletScreen from './wallet';
import WalletHistoryScreen from './wallet/history';
import WalletTopupScreen from './wallet/topup';

type TabType = 'balance' | 'topup' | 'history';

export default function WalletTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('balance');

  const renderContent = () => {
    switch (activeTab) {
      case 'balance':
        return <WalletScreen />;
      case 'topup':
        return <WalletTopupScreen />;
      case 'history':
        return <WalletHistoryScreen />;
      default:
        return <WalletScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balance' && styles.activeTab]}
          onPress={() => setActiveTab('balance')}
        >
          <Text style={[styles.tabText, activeTab === 'balance' && styles.activeTabText]}>
            Balance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'topup' && styles.activeTab]}
          onPress={() => setActiveTab('topup')}
        >
          <Text style={[styles.tabText, activeTab === 'topup' && styles.activeTabText]}>
            Top-up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
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
