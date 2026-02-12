/**
 * NotificationContext
 * Manages Expo Push Notifications
 * - Requests permissions on app start
 * - Registers push token with backend
 * - Provides local notification functionality
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import { useAuth } from './AuthContext';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  /** Expo push token for this device */
  expoPushToken: string | null;
  /** Whether notifications are enabled */
  notificationsEnabled: boolean;
  /** Request permission and get push token */
  requestPermissions: () => Promise<boolean>;
  /** Register push token with backend */
  registerToken: (userId: string) => Promise<boolean>;
  /** Send a local notification (for testing) */
  sendLocalNotification: (title: string, body: string, data?: Record<string, any>) => Promise<void>;
  /** Schedule a notification for later */
  scheduleNotification: (options: {
    title: string;
    body: string;
    trigger: Notifications.NotificationTriggerInput;
    data?: Record<string, any>;
  }) => Promise<string>;
  /** Cancel all scheduled notifications */
  cancelAllScheduledNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  /**
   * Request notification permissions and get push token
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Check if device is a physical device (simulators don't support push)
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return false;
      }

      // Check existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied');
        setNotificationsEnabled(false);
        return false;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your EAS project ID
      });

      setExpoPushToken(tokenData.data);
      setNotificationsEnabled(true);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E75480',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  /**
   * Register push token with backend
   */
  const registerToken = useCallback(async (userId: string): Promise<boolean> => {
    if (!expoPushToken) {
      console.log('No push token available');
      return false;
    }

    try {
      await api.post('/users/push-token', {
        userId,
        pushToken: expoPushToken,
        platform: Platform.OS,
      });
      console.log('Push token registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }, [expoPushToken]);

  /**
   * Send a local notification immediately
   */
  const sendLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // null = immediate
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
      Toast.show({
        type: 'error',
        text1: 'Notification failed',
        text2: 'Could not send notification',
      });
    }
  }, []);

  /**
   * Schedule a notification for later
   */
  const scheduleNotification = useCallback(async ({
    title,
    body,
    trigger,
    data,
  }: {
    title: string;
    body: string;
    trigger: Notifications.NotificationTriggerInput;
    data?: Record<string, any>;
  }): Promise<string> => {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger,
      });
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }, []);

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllScheduledNotifications = useCallback(async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }, []);

  // Request permissions on app start
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // Register token when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id && expoPushToken) {
      registerToken(user.id);
    }
  }, [isAuthenticated, user?.id, expoPushToken, registerToken]);

  // Listen for incoming notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  // Listen for notification responses (user taps notification)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      const { data } = response.notification.request.content;
      
      // Handle navigation based on notification type
      if (data?.type === 'booking' && data?.bookingId) {
        // Navigate to booking details
        // router.push(`/bookings/${data.bookingId}`);
      } else if (data?.type === 'dispute' && data?.bookingId) {
        // Navigate to dispute screen
        // router.push(`/disputes/${data.bookingId}`);
      }
    });

    return () => subscription.remove();
  }, []);

  const value: NotificationContextType = {
    expoPushToken,
    notificationsEnabled,
    requestPermissions,
    registerToken,
    sendLocalNotification,
    scheduleNotification,
    cancelAllScheduledNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/** Hook to access notification context */
export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
