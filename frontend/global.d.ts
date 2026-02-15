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

// Fix for WalletTransaction type
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
}
