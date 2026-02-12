/**
 * AuthGate - Redirects to login when not authenticated
 * Simplified version to prevent crashes
 */

import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function AuthGate() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const isLoginScreen = segments[0] === "login" || segments[0] === "signup";

    if (!user || !token) {
      // Not logged in
      if (inAuthGroup) {
        // Redirect to login if trying to access protected routes
        router.replace("/login");
      }
    } else {
      // Logged in
      if (isLoginScreen) {
        // Redirect to main app if on login screen
        router.replace("/(tabs)");
      }
    }
  }, [user, token, loading, segments]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: '#FFF5F7'
      }}>
        <ActivityIndicator size="large" color="#E75480" />
      </View>
    );
  }

  // AuthGate doesn't render anything visible - it just handles redirects
  return null;
}
