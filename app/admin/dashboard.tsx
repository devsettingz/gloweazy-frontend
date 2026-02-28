/**
 * Admin Dashboard
 * Overview of platform statistics and key metrics
 */

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getDashboardStats } from "../../utils/adminApi";

interface Stats {
  users: {
    total: number;
    clients: number;
    stylists: number;
    newToday: number;
    active: number;
  };
  bookings: {
    total: number;
    today: number;
    thisMonth: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  finance: {
    totalRevenue: number;
    today: number;
    thisMonth: number;
    totalWalletBalance: number;
  };
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: string;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <View style={styles.statHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      {trend && (
        <View style={styles.trendBadge}>
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

const RecentActivityItem = ({
  type,
  title,
  subtitle,
  time,
}: {
  type: "booking" | "transaction" | "user";
  title: string;
  subtitle: string;
  time: string;
}) => {
  const icons = {
    booking: "calendar",
    transaction: "cash",
    user: "person",
  };

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons name={icons[type]} size={18} color="#E75480" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E75480" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/users" as any)}
          >
            <Ionicons name="person-add" size={24} color="#E75480" />
            <Text style={styles.actionText}>Add User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/stylists" as any)}
          >
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.actionText}>Approve Stylists</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/bookings" as any)}
          >
            <Ionicons name="time" size={24} color="#FF9500" />
            <Text style={styles.actionText}>Pending Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/finance" as any)}
          >
            <Ionicons name="trending-up" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Revenue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Users Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats?.users.total || 0}
            subtitle={`${stats?.users.newToday || 0} new today`}
            icon="people"
            color="#E75480"
            trend="+12%"
          />
          <StatCard
            title="Clients"
            value={stats?.users.clients || 0}
            subtitle="Active customers"
            icon="person"
            color="#007AFF"
          />
          <StatCard
            title="Stylists"
            value={stats?.users.stylists || 0}
            subtitle="Service providers"
            icon="cut"
            color="#34C759"
          />
          <StatCard
            title="Active Now"
            value={stats?.users.active || 0}
            subtitle="Currently online"
            icon="radio-button-on"
            color="#FF9500"
          />
        </View>
      </View>

      {/* Booking Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bookings</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Bookings"
            value={stats?.bookings.total || 0}
            subtitle={`${stats?.bookings.thisMonth || 0} this month`}
            icon="calendar"
            color="#5856D6"
          />
          <StatCard
            title="Today"
            value={stats?.bookings.today || 0}
            subtitle="New bookings"
            icon="today"
            color="#E75480"
          />
          <StatCard
            title="Pending"
            value={stats?.bookings.pending || 0}
            subtitle="Awaiting confirmation"
            icon="time"
            color="#FF9500"
          />
          <StatCard
            title="Completed"
            value={stats?.bookings.completed || 0}
            subtitle="Finished services"
            icon="checkmark-done"
            color="#34C759"
          />
        </View>
      </View>

      {/* Financial Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Revenue"
            value={`GHS ${(stats?.finance.totalRevenue || 0).toLocaleString()}`}
            subtitle="All time earnings"
            icon="cash"
            color="#34C759"
            trend="+8%"
          />
          <StatCard
            title="Today's Revenue"
            value={`GHS ${(stats?.finance.today || 0).toLocaleString()}`}
            subtitle="Daily earnings"
            icon="trending-up"
            color="#E75480"
          />
          <StatCard
            title="This Month"
            value={`GHS ${(stats?.finance.thisMonth || 0).toLocaleString()}`}
            subtitle="Monthly revenue"
            icon="calendar-clear"
            color="#007AFF"
          />
          <StatCard
            title="Wallet Balance"
            value={`GHS ${(stats?.finance.totalWalletBalance || 0).toLocaleString()}`}
            subtitle="Total user funds"
            icon="wallet"
            color="#5856D6"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <RecentActivityItem
            type="booking"
            title="New Booking #1234"
            subtitle="Sarah Johnson booked with Nana Yaa"
            time="2 min ago"
          />
          <RecentActivityItem
            type="transaction"
            title="Payment Received"
            subtitle="GHS 250.00 from John Doe"
            time="15 min ago"
          />
          <RecentActivityItem
            type="user"
            title="New Stylist Registered"
            subtitle="Akosua Beauty joined the platform"
            time="1 hour ago"
          />
          <RecentActivityItem
            type="booking"
            title="Booking Completed"
            subtitle="#1230 - Box Braids service"
            time="2 hours ago"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    flex: 1,
    minWidth: 150,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    flex: 1,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    backgroundColor: "#34C75920",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  trendText: {
    color: "#34C759",
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    padding: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFE4EC",
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#666",
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
  },
});
