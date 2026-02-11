import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";

export default function withClientGuard(WrappedComponent: React.ComponentType<any>) {
  return function GuardedComponent(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user?.role !== "client") {
        Toast.show({
          type: "error",
          text1: "Access denied",
          text2: "Only clients can access this screen 🚫",
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

    if (user?.role !== "client") {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
