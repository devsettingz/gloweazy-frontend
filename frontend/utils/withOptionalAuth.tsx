/**
 * withOptionalAuth Guard
 * Allows both authenticated users and guests to access the screen
 * For Guest Checkout flow - doesn't redirect if not logged in
 */

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

interface WithOptionalAuthProps {
  isGuest?: boolean;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function withOptionalAuth(
  WrappedComponent: React.ComponentType<any>
) {
  return function OptionalAuthComponent(props: any) {
    const { loading } = useAuth();

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E75480" />
          <Text style={{ marginTop: 12, color: "#666" }}>Loading...</Text>
        </View>
      );
    }

    // Allow access regardless of auth status
    return <WrappedComponent {...props} />;
  };
}
