/**
 * Root Layout - Simplified for stability
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../context/AuthContext';
import { WalletProvider } from '../context/WalletContext';
import { NotificationProvider } from '../context/NotificationContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WalletProvider>
          <NotificationProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                {/* Main screens */}
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                
                {/* Tab screens */}
                <Stack.Screen name="(tabs)" />
                
                {/* Other screens */}
                <Stack.Screen name="checkout" />
                <Stack.Screen name="confirmation" />
                <Stack.Screen name="payments" />
                <Stack.Screen name="wallet" />
                <Stack.Screen name="wallet-tabs" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
              <StatusBar style="auto" />
              <Toast />
            </ThemeProvider>
          </NotificationProvider>
        </WalletProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
