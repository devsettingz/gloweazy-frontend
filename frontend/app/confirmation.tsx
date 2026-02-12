/**
 * Booking Confirmation Screen
 * Shows success message and booking details
 * Supports both regular and guest checkout flows
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";

// QR Code Placeholder Component
const QRCodePlaceholder = ({ code }: { code: string }) => (
  <View style={styles.qrContainer}>
    <View style={styles.qrCode}>
      <Text style={styles.qrIcon}>▦</Text>
      <Text style={styles.qrText}>{code}</Text>
    </View>
    <Text style={styles.qrLabel}>Show this at your appointment</Text>
  </View>
);

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract params
  const {
    serviceName,
    stylistName,
    date,
    time,
    amount,
    isGuest,
    bookingRef,
    guestName,
    guestEmail,
  } = params;

  const isGuestMode = isGuest === "true";
  const reference = (bookingRef as string) || `BK${Date.now().toString(36).toUpperCase()}`;

  // Share booking details
  const handleShare = async () => {
    try {
      const message = isGuestMode
        ? `🎉 Booking Confirmed!\n\n📋 ${serviceName}\n💇 ${stylistName}\n📅 ${date} at ${time}\n💰 $${amount}\n\nRef: ${reference}\n\nWe'll email updates to ${guestEmail}.`
        : `🎉 Booking Confirmed!\n\n📋 ${serviceName}\n💇 ${stylistName}\n📅 ${date} at ${time}\n💰 $${amount}`;

      await Share.share({
        message,
        title: "My Appointment",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Success Header */}
      <View style={styles.header}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          {isGuestMode
            ? `Thanks ${guestName}, your appointment is booked!`
            : "Your appointment has been scheduled"}
        </Text>
      </View>

      {/* Booking Card */}
      <View style={styles.bookingCard}>
        <Text style={styles.cardTitle}>Booking Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{serviceName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stylist</Text>
          <Text style={styles.detailValue}>{stylistName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>
            {date} at {time}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.priceValue}>${amount}</Text>
        </View>

        <View style={[styles.detailRow, styles.referenceRow]}>
          <Text style={styles.detailLabel}>Reference</Text>
          <Text style={styles.referenceValue}>{reference}</Text>
        </View>
      </View>

      {/* QR Code for Guest */}
      {isGuestMode && <QRCodePlaceholder code={reference} />}

      {/* Guest-specific messaging */}
      {isGuestMode && (
        <View style={styles.guestInfoCard}>
          <Text style={styles.guestInfoIcon}>📧</Text>
          <Text style={styles.guestInfoTitle}>Check your email</Text>
          <Text style={styles.guestInfoText}>
            We've sent a confirmation to {guestEmail}. We'll also email you any updates about
            your appointment.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Share Booking</Text>
        </TouchableOpacity>

        {/* Guest: Create Account CTA */}
        {isGuestMode && (
          <View style={styles.createAccountSection}>
            <Text style={styles.createAccountTitle}>Want to manage your booking?</Text>
            <Text style={styles.createAccountText}>
              Create an account to reschedule, cancel, or view your booking history.
            </Text>
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() =>
                router.push({
                  pathname: "/signup",
                  params: {
                    guestEmail: guestEmail as string,
                    guestName: guestName as string,
                    redirectTo: "/bookings",
                  },
                })
              }
            >
              <Text style={styles.createAccountButtonText}>Create Free Account →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back to Home */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push(isGuestMode ? "/discover" : "/")}
        >
          <Text style={styles.homeButtonText}>
            {isGuestMode ? "Browse More Stylists" : "Back to Home"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    backgroundColor: "#34C759",
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  bookingCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E75480",
  },
  referenceRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  referenceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E75480",
    letterSpacing: 0.5,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 20,
  },
  qrCode: {
    width: 180,
    height: 180,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5EA",
    padding: 20,
  },
  qrIcon: {
    fontSize: 80,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  qrText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 1,
  },
  qrLabel: {
    marginTop: 12,
    fontSize: 13,
    color: "#8E8E93",
  },
  guestInfoCard: {
    backgroundColor: "#E3F2FD",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  guestInfoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  guestInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1565C0",
    marginBottom: 4,
  },
  guestInfoText: {
    fontSize: 14,
    color: "#424242",
    textAlign: "center",
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  shareButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginBottom: 16,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  createAccountSection: {
    backgroundColor: "#FFF5F7",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E75480",
  },
  createAccountTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E75480",
    marginBottom: 6,
  },
  createAccountText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  createAccountButton: {
    backgroundColor: "#E75480",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  createAccountButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  homeButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "500",
  },
});
