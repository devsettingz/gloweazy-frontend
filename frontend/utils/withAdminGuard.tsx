import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";

export default function withAdminGuard(WrappedComponent: React.ComponentType<any>) {
  return function GuardedComponent(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user?.role !== "admin") {
        Toast.show({
          type: "error",
          text1: "Access denied",
          text2: "Only admins can access this screen 🚫",
        });
        router.replace("/");
      }
    }, [user, loading]);

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Checking access...</Text>
        </View>
      );
    }

    if (user?.role !== "admin") {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
