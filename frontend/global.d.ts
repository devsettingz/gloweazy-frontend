// Type declarations for missing modules

declare module 'expo-linear-gradient' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';

  export interface LinearGradientProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
    style?: ViewStyle;
    children?: React.ReactNode;
  }

  export class LinearGradient extends React.Component<LinearGradientProps> {}
  export default LinearGradient;
}

declare module 'react-native-toast-message' {
  import * as React from 'react';

  export interface ToastConfig {
    type?: string;
    text1?: string;
    text2?: string;
    position?: 'top' | 'bottom';
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
    onShow?: () => void;
    onHide?: () => void;
    onPress?: () => void;
  }

  export default class Toast extends React.Component {
    static show(options: ToastConfig): void;
    static hide(): void;
  }
}

declare module 'expo-location' {
  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export interface LocationPermissionResponse {
    status: 'granted' | 'denied' | 'undetermined';
    granted: boolean;
  }

  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: { accuracy?: number }): Promise<LocationObject>;
  export function getLastKnownPositionAsync(): Promise<LocationObject | null>;
}

declare module '@react-native-community/datetimepicker' {
  import * as React from 'react';

  export interface DateTimePickerProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    onChange?: (event: any, date?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    minuteInterval?: number;
  }

  export default class DateTimePicker extends React.Component<DateTimePickerProps> {}
}

declare module 'expo-notifications' {
  export interface Notification {
    request: {
      identifier: string;
      content: {
        title: string;
        body: string;
        data?: any;
      };
    };
  }

  export interface NotificationResponse {
    notification: Notification;
    actionIdentifier: string;
    userText?: string;
  }

  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<{ shouldShowAlert: boolean; shouldPlaySound: boolean; shouldSetBadge: boolean }>;
  }): void;

  export function getExpoPushTokenAsync(): Promise<{ data: string }>;
  export function getDevicePushTokenAsync(): Promise<{ data: string }>;
  export function setBadgeCountAsync(count: number): Promise<void>;
  export function getPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function requestPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function addNotificationReceivedListener(listener: (notification: Notification) => void): { remove: () => void };
  export function addNotificationResponseReceivedListener(listener: (response: NotificationResponse) => void): { remove: () => void };
  export function dismissAllNotificationsAsync(): Promise<void>;
}

declare module 'expo-device' {
  export const isDevice: boolean;
  export const brand: string | null;
  export const manufacturer: string | null;
  export const modelName: string | null;
  export const deviceType: number | null;
  export const osName: string | null;
  export const osVersion: string | null;
  export const platformApiLevel: number | null;
}

// Fix for WalletTransaction type used across files
export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'escrow' | 'payout';
  amount: number;
  currency?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'released';
  createdAt: string;
  bookingId?: string;
  reference?: string;
  method?: string;
  note?: string;
}

// Make sure the module is also declared
declare module '*.tsx' {
  export * from 'react';
}

declare module '*.ts' {
  export * from 'react';
}
