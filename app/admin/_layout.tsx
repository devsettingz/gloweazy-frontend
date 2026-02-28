/**
 * Admin Layout
 * Professional admin dashboard with sidebar navigation
 */

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter, usePathname, Slot } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = 260;

const MENU_ITEMS = [
  { path: "/admin/dashboard", icon: "grid", label: "Dashboard" },
  { path: "/admin/users", icon: "people", label: "Users" },
  { path: "/admin/stylists", icon: "cut", label: "Stylists" },
  { path: "/admin/bookings", icon: "calendar", label: "Bookings" },
  { path: "/admin/finance", icon: "cash", label: "Finance" },
  { path: "/admin/settings", icon: "settings", label: "Settings" },
];

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/(tabs)/client-bookings");
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  if (!user || user.role !== "admin") {
    return (
      <View style={styles.loadingContainer}>
        <Text>Checking admin access...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={[styles.sidebar, !isSidebarOpen && styles.sidebarClosed]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.logo}>GlowEazy</Text>
          <Text style={styles.adminBadge}>ADMIN</Text>
        </View>

        <ScrollView style={styles.menu}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => navigateTo(item.path)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isActive ? "#E75480" : "#666"}
                />
                {isSidebarOpen && (
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sidebarFooter}>
          <TouchableOpacity style={styles.userInfo}>
            <Ionicons name="person-circle" size={32} color="#E75480" />
            {isSidebarOpen && (
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FF3B30" />
            {isSidebarOpen && <Text style={styles.logoutText}>Logout</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuToggle}
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {MENU_ITEMS.find((item) => item.path === pathname)?.label || "Admin"}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Content */}
        <ScrollView style={styles.content}>
          <Slot />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E5E5EA",
    flexDirection: "column",
  },
  sidebarClosed: {
    width: 70,
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E75480",
  },
  adminBadge: {
    fontSize: 10,
    color: "#E75480",
    fontWeight: "600",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#FFE4EC",
    borderRadius: 4,
  },
  menu: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuItemActive: {
    backgroundColor: "#FFE4EC",
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
  },
  menuLabelActive: {
    color: "#E75480",
    fontWeight: "600",
  },
  sidebarFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  userDetails: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
  },
  logoutText: {
    marginLeft: 10,
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  menuToggle: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginLeft: 15,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
