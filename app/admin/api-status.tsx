/**
 * Admin API Status Dashboard
 * Tests all critical backend endpoints and displays HTTP status codes
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";


interface EndpointTest {
  id: string;
  name: string;
  method: string;
  endpoint: string;
  status: "idle" | "loading" | "success" | "error";
  statusCode?: number;
  response?: any;
  error?: string;
}

const INITIAL_ENDPOINTS: EndpointTest[] = [
  {
    id: "auth-login",
    name: "Auth Login",
    method: "POST",
    endpoint: "/auth/login",
    status: "idle",
  },
  {
    id: "bookings-create",
    name: "Create Booking",
    method: "POST",
    endpoint: "/bookings",
    status: "idle",
  },
  {
    id: "wallet-balance",
    name: "Wallet Balance",
    method: "GET",
    endpoint: "/wallet/balance",
    status: "idle",
  },
  {
    id: "stylist-services",
    name: "Stylist Services",
    method: "GET",
    endpoint: "/stylist/services",
    status: "idle",
  },
  {
    id: "escrow-hold",
    name: "Escrow Hold",
    method: "POST",
    endpoint: "/wallet/escrow/hold",
    status: "idle",
  },
  {
    id: "bookings-list",
    name: "List Bookings",
    method: "GET",
    endpoint: "/bookings",
    status: "idle",
  },
  {
    id: "disputes-list",
    name: "List Disputes",
    method: "GET",
    endpoint: "/bookings/disputes",
    status: "idle",
  },
  {
    id: "stylists-search",
    name: "Search Stylists",
    method: "GET",
    endpoint: "/stylists/search",
    status: "idle",
  },
];

function ApiStatusScreen() {
  const { token } = useAuth();
  const [endpoints, setEndpoints] = useState<EndpointTest[]>(INITIAL_ENDPOINTS);
  const [testingAll, setTestingAll] = useState(false);

  const updateEndpoint = (id: string, updates: Partial<EndpointTest>) => {
    setEndpoints((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, ...updates } : ep))
    );
  };

  const testAuthLogin = async () => {
    const id = "auth-login";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.post("/auth/login", {
        email: "test@test.com",
        password: "password123",
      });

      updateEndpoint(id, {
        status: "success",
        statusCode: 200,
        response: { user: response.data.user?.email || "Found", token: "***" },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");
      
      updateEndpoint(id, {
        status: "error",
        statusCode: status,
        error: is404 
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports" 
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testCreateBooking = async () => {
    const id = "bookings-create";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.post("/bookings", {
        stylistId: "test_stylist_001",
        serviceId: "test_service_001",
        date: "2026-02-15",
        startTime: "10:00",
        amount: 50,
        isGuest: true,
        guestInfo: {
          name: "Test User",
          email: "test@example.com",
          phone: "555-0123",
          saveInfo: false,
        },
      });

      updateEndpoint(id, {
        status: "success",
        statusCode: 201,
        response: { bookingId: response.data.bookingId, reference: response.data.reference },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");
      
      // 400 is expected (validation error), 201 is success
      const isExpected = status === 400 || status === 201 || status === 200;

      updateEndpoint(id, {
        status: isExpected ? "success" : "error",
        statusCode: status,
        error: is404
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports"
          : status === 400
          ? "⚠️ 400 Bad Request (Expected - validation)"
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testWalletBalance = async () => {
    const id = "wallet-balance";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.get("/wallet/balance");

      updateEndpoint(id, {
        status: "success",
        statusCode: 200,
        response: { balance: response.data.balance, escrow: response.data.escrowAmount },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");
      const is401 = status === 401;

      updateEndpoint(id, {
        status: is401 ? "success" : "error", // 401 is expected without token
        statusCode: status,
        error: is404
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports"
          : is401
          ? "⚠️ 401 Unauthorized (Expected - no token)"
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testStylistServices = async () => {
    const id = "stylist-services";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.get("/stylist/services");

      updateEndpoint(id, {
        status: "success",
        statusCode: 200,
        response: { count: response.data.services?.length || 0 },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");
      const is401 = status === 401;

      updateEndpoint(id, {
        status: is401 ? "success" : "error", // 401 is expected without token
        statusCode: status,
        error: is404
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports"
          : is401
          ? "⚠️ 401 Unauthorized (Expected - protected route)"
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testEscrowHold = async () => {
    const id = "escrow-hold";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.post("/wallet/escrow/hold", {
        bookingId: "test_booking_001",
        amount: 50,
      });

      updateEndpoint(id, {
        status: "success",
        statusCode: 200,
        response: { message: response.data.message },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");
      const is401 = status === 401;
      const is400 = status === 400;

      updateEndpoint(id, {
        status: is401 || is400 ? "success" : "error", // 401/400 are expected
        statusCode: status,
        error: is404
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports"
          : is401
          ? "⚠️ 401 Unauthorized (Expected - no token)"
          : is400
          ? "⚠️ 400 Bad Request (Expected - no wallet balance)"
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testListBookings = async () => {
    const id = "bookings-list";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.get("/bookings");

      updateEndpoint(id, {
        status: "success",
        statusCode: 200,
        response: { count: response.data.bookings?.length || 0 },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");
      const is401 = status === 401;

      updateEndpoint(id, {
        status: is401 ? "success" : "error",
        statusCode: status,
        error: is404
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports"
          : is401
          ? "⚠️ 401 Unauthorized (Expected - protected route)"
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testListDisputes = async () => {
    const id = "disputes-list";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.get("/bookings/disputes");

      updateEndpoint(id, {
        status: "success",
        statusCode: 200,
        response: { count: response.data.length || 0 },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");
      const is401 = status === 401;
      const is403 = status === 403;

      updateEndpoint(id, {
        status: is401 || is403 ? "success" : "error",
        statusCode: status,
        error: is404
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports"
          : is401
          ? "⚠️ 401 Unauthorized (Expected - no token)"
          : is403
          ? "⚠️ 403 Forbidden (Expected - admin only)"
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testSearchStylists = async () => {
    const id = "stylists-search";
    updateEndpoint(id, { status: "loading", statusCode: undefined, error: undefined });

    try {
      const response = await api.get("/stylists/search?q=test");

      updateEndpoint(id, {
        status: "success",
        statusCode: 200,
        response: { count: response.data.stylists?.length || 0 },
      });
    } catch (error: any) {
      const status = error.response?.status || 0;
      const is404 = status === 404 || error.message?.includes("404");

      updateEndpoint(id, {
        status: "error",
        statusCode: status,
        error: is404
          ? "❌ ROUTE NOT FOUND (404) - Check server.js imports"
          : error.response?.data?.message || error.message,
        response: error.response?.data,
      });
    }
  };

  const testEndpoint = async (endpoint: EndpointTest) => {
    switch (endpoint.id) {
      case "auth-login":
        await testAuthLogin();
        break;
      case "bookings-create":
        await testCreateBooking();
        break;
      case "wallet-balance":
        await testWalletBalance();
        break;
      case "stylist-services":
        await testStylistServices();
        break;
      case "escrow-hold":
        await testEscrowHold();
        break;
      case "bookings-list":
        await testListBookings();
        break;
      case "disputes-list":
        await testListDisputes();
        break;
      case "stylists-search":
        await testSearchStylists();
        break;
    }
  };

  const testAll = async () => {
    setTestingAll(true);
    Toast.show({ type: "info", text1: "Testing all endpoints..." });

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setTestingAll(false);
    Toast.show({ type: "success", text1: "All endpoints tested!" });
  };

  const getStatusColor = (endpoint: EndpointTest) => {
    if (endpoint.status === "idle") return "#8E8E93";
    if (endpoint.status === "loading") return "#007AFF";
    if (endpoint.status === "success") {
      // Green for 2xx, Yellow for expected errors (401/400)
      if (endpoint.statusCode && endpoint.statusCode >= 200 && endpoint.statusCode < 300) {
        return "#34C759"; // Green
      }
      if (endpoint.statusCode === 401 || endpoint.statusCode === 400 || endpoint.statusCode === 403) {
        return "#FF9500"; // Orange (expected)
      }
      return "#34C759";
    }
    return "#FF3B30"; // Red for errors
  };

  const getStatusText = (endpoint: EndpointTest) => {
    if (endpoint.status === "idle") return "Not Tested";
    if (endpoint.status === "loading") return "Testing...";
    if (endpoint.statusCode) {
      if (endpoint.statusCode === 200 || endpoint.statusCode === 201) {
        return `${endpoint.statusCode} ✅`;
      }
      if (endpoint.statusCode === 401 || endpoint.statusCode === 400 || endpoint.statusCode === 403) {
        return `${endpoint.statusCode} ⚠️`;
      }
      if (endpoint.statusCode === 404) {
        return `${endpoint.statusCode} ❌ MISSING`;
      }
      return `${endpoint.statusCode} ❌`;
    }
    return "Error";
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔧 API Status</Text>
        <Text style={styles.headerSubtitle}>Test backend endpoints</Text>
      </View>

      {/* Test All Button */}
      <TouchableOpacity
        style={[styles.testAllButton, testingAll && styles.testAllButtonDisabled]}
        onPress={testAll}
        disabled={testingAll}
      >
        {testingAll ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.testAllButtonText}>🚀 Test All Endpoints</Text>
        )}
      </TouchableOpacity>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#34C759" }]} />
          <Text style={styles.legendText}>200/201 Success</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF9500" }]} />
          <Text style={styles.legendText}>400/401 Expected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF3B30" }]} />
          <Text style={styles.legendText}>404/500 Error</Text>
        </View>
      </View>

      {/* Endpoints List */}
      <View style={styles.endpointsContainer}>
        {endpoints.map((endpoint) => (
          <TouchableOpacity
            key={endpoint.id}
            style={[
              styles.endpointCard,
              { borderLeftColor: getStatusColor(endpoint), borderLeftWidth: 4 },
            ]}
            onPress={() => testEndpoint(endpoint)}
            disabled={endpoint.status === "loading"}
          >
            <View style={styles.endpointHeader}>
              <View style={styles.methodBadge}>
                <Text style={styles.methodText}>{endpoint.method}</Text>
              </View>
              <View style={styles.statusBadge}>
                {endpoint.status === "loading" ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(endpoint) },
                    ]}
                  >
                    {getStatusText(endpoint)}
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.endpointName}>{endpoint.name}</Text>
            <Text style={styles.endpointPath}>{endpoint.endpoint}</Text>

            {endpoint.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{endpoint.error}</Text>
              </View>
            )}

            {endpoint.response && endpoint.status === "success" && !endpoint.error && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseText}>
                  {JSON.stringify(endpoint.response, null, 2).slice(0, 100)}
                  {JSON.stringify(endpoint.response).length > 100 ? "..." : ""}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>🔍 Debug Info</Text>
        <Text style={styles.debugText}>Base URL: {api.defaults.baseURL}</Text>
        <Text style={styles.debugText}>Auth Token: {token ? "✅ Present" : "❌ None"}</Text>
        <Text style={styles.debugText}>
          Timestamp: {new Date().toISOString()}
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default ApiStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  testAllButton: {
    backgroundColor: "#E75480",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  testAllButtonDisabled: {
    opacity: 0.6,
  },
  testAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#3A3A3C",
  },
  endpointsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  endpointCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  endpointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  methodBadge: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  methodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  endpointName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  endpointPath: {
    fontSize: 13,
    color: "#8E8E93",
    fontFamily: "monospace",
  },
  errorContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFEBEB",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
  },
  responseContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  responseText: {
    fontSize: 11,
    color: "#3A3A3C",
    fontFamily: "monospace",
  },
  debugContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    color: "#8E8E93",
    fontFamily: "monospace",
    marginBottom: 4,
  },
});
