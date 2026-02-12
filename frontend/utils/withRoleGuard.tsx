import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth, UserRole } from "../context/AuthContext";

/**
 * Multi-role guard HOC
 * Usage:
 *   withRoleGuard(Component, "admin")                    // single role
 *   withRoleGuard(Component, ["admin", "stylist"])       // multiple roles
 */
type RoleOrRoles = UserRole | UserRole[];

export default function withRoleGuard(
  WrappedComponent: React.ComponentType<any>,
  allowedRoles: RoleOrRoles
) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const roleNames = roles.join("/");

  return function GuardedComponent(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    const hasAccess = user?.role && roles.includes(user.role);

    useEffect(() => {
      if (!loading && !hasAccess) {
        Toast.show({
          type: "error",
          text1: "Access denied",
          text2: `Only ${roleNames} users can access this screen 🚫`,
        });
        router.replace("/");
      }
    }, [user, loading, hasAccess]);

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E75480" />
          <Text style={{ marginTop: 12, color: "#666" }}>Checking access...</Text>
        </View>
      );
    }

    if (!hasAccess) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
