/**
 * Profile Tabs - Simplified version without material-top-tabs
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProfileSetupScreen from '../(tabs)/profile-setup';
import { useAuth } from '../../context/AuthContext';
import ProfileInfoScreen from './info';
import ProfileSecurityScreen from './security';
import ProfileSettingsScreen from './settings';

type TabType = 'info' | 'settings' | 'security' | 'setup';

export default function ProfileTabs() {
  const { updateActivity } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    updateActivity();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfoScreen />;
      case 'settings':
        return <ProfileSettingsScreen />;
      case 'security':
        return <ProfileSecurityScreen />;
      case 'setup':
        return <ProfileSetupScreen />;
      default:
        return <ProfileInfoScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => handleTabChange('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => handleTabChange('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'security' && styles.activeTab]}
          onPress={() => handleTabChange('security')}
        >
          <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
            Security
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'setup' && styles.activeTab]}
          onPress={() => handleTabChange('setup')}
        >
          <Text style={[styles.tabText, activeTab === 'setup' && styles.activeTabText]}>
            Setup
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
    fontSize: 12,
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
