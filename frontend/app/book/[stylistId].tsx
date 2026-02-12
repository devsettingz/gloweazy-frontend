/**
 * Client Booking Flow with Guest Checkout
 * Path: /book/[stylistId]
 * Supports both authenticated users and guest checkout (Vagaro killer feature!)
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { notifyNewBooking } from "../../utils/notifications";
import withOptionalAuth from "../../utils/withOptionalAuth";
import api from "../../utils/api";
import CalendarPicker from "../../components/CalendarPicker";
import TimeSlotGrid, { TimeSlot } from "../../components/TimeSlotGrid";
import { Service, CreateBookingDTO } from "../../types/booking";

// Mock services - replace with API call
const MOCK_SERVICES: Service[] = [
  {
    id: "svc_1",
    name: "Haircut & Styling",
    description: "Professional haircut with wash and style",
    price: 45,
    durationMinutes: 60,
    stylistId: "",
    category: "Hair",
  },
  {
    id: "svc_2",
    name: "Hair Coloring",
    description: "Full color treatment with premium products",
    price: 85,
    durationMinutes: 120,
    stylistId: "",
    category: "Hair",
  },
  {
    id: "svc_3",
    name: "Braiding",
    description: "Box braids or cornrows",
    price: 65,
    durationMinutes: 180,
    stylistId: "",
    category: "Hair",
  },
  {
    id: "svc_4",
    name: "Makeup Session",
    description: "Full face makeup for any occasion",
    price: 55,
    durationMinutes: 45,
    stylistId: "",
    category: "Makeup",
  },
];

// Generate mock time slots based on selected date
const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    const time1 = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
    slots.push({
      time: time1,
      isAvailable: Math.random() > 0.3,
    });

    const time2 = `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? "PM" : "AM"}`;
    slots.push({
      time: time2,
      isAvailable: Math.random() > 0.3,
    });
  }

  return slots;
};

// Guest info interface
interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  saveInfo: boolean;
}

function BookingScreen() {
  const { stylistId } = useLocalSearchParams();
  const router = useRouter();
  const { user, updateActivity } = useAuth();
  const isAuthenticated = !!user;

  // Auth mode state
  const [isGuestMode, setIsGuestMode] = useState(!isAuthenticated);

  // Guest info state
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: "",
    email: "",
    phone: "",
    saveInfo: false,
  });

  // Stylist info
  const [stylistName, setStylistName] = useState<string>("Stylist");
  const [loadingStylist, setLoadingStylist] = useState(true);

  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);

  // Fetch stylist info on mount
  useEffect(() => {
    fetchStylistInfo();
  }, [stylistId]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    } else {
      setTimeSlots([]);
      setSelectedTime(null);
    }
  }, [selectedDate]);

  const fetchStylistInfo = async () => {
    try {
      setLoadingStylist(true);
      setTimeout(() => {
        setStylistName("Jane's Beauty Studio");
        setLoadingStylist(false);
      }, 500);
    } catch (err) {
      console.error("Error fetching stylist:", err);
      setStylistName("Stylist");
      setLoadingStylist(false);
    }
  };

  const fetchTimeSlots = async (date: Date) => {
    try {
      setLoadingSlots(true);
      setSelectedTime(null);
      setTimeout(() => {
        setTimeSlots(generateTimeSlots(date));
        setLoadingSlots(false);
      }, 600);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load time slots",
        text2: "Please try again ❌",
      });
      setLoadingSlots(false);
    }
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseTimeToHHmm = (timeStr: string): string => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let hour24 = hours;

    if (period === "PM" && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === "AM" && hours === 12) {
      hour24 = 0;
    }

    return `${String(hour24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const calculateEndTime = (startTimeStr: string, durationMinutes: number): string => {
    const startTime = parseTimeToHHmm(startTimeStr);
    const [hours, minutes] = startTime.split(":").map(Number);

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const endHours = String(endDate.getHours()).padStart(2, "0");
    const endMinutes = String(endDate.getMinutes()).padStart(2, "0");

    return `${endHours}:${endMinutes}`;
  };

  // Validate guest info
  const validateGuestInfo = (): boolean => {
    if (!guestInfo.name.trim()) {
      Toast.show({
        type: "error",
        text1: "Name required",
        text2: "Please enter your full name",
      });
      return false;
    }
    if (!guestInfo.email.trim() || !guestInfo.email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Valid email required",
        text2: "Please enter a valid email address",
      });
      return false;
    }
    if (!guestInfo.phone.trim() || guestInfo.phone.length < 10) {
      Toast.show({
        type: "error",
        text1: "Phone required",
        text2: "Please enter a valid phone number",
      });
      return false;
    }
    return true;
  };

  const canSubmit = useMemo(() => {
    const hasBookingDetails = selectedService && selectedDate && selectedTime;
    if (isGuestMode) {
      return hasBookingDetails && guestInfo.name && guestInfo.email && guestInfo.phone;
    }
    return hasBookingDetails && isAuthenticated;
  }, [selectedService, selectedDate, selectedTime, isGuestMode, guestInfo, isAuthenticated]);

  const handleConfirmBooking = async () => {
    if (!canSubmit || !selectedService || !selectedDate || !selectedTime) {
      return;
    }

    if (isGuestMode && !validateGuestInfo()) {
      return;
    }

    Alert.alert(
      "Confirm Booking",
      `Book ${selectedService.name} with ${stylistName} on ${selectedDate.toLocaleDateString()} at ${selectedTime}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: executeBooking,
        },
      ]
    );
  };

  const executeBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    try {
      setSubmitting(true);

      // Generate booking reference
      const bookingRef = `BK${Date.now().toString(36).toUpperCase()}`;

      const bookingData: any = {
        stylistId: stylistId as string,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        amount: selectedService.price,
        date: formatDateString(selectedDate),
        startTime: parseTimeToHHmm(selectedTime),
        endTime: calculateEndTime(selectedTime, selectedService.durationMinutes),
        isGuest: isGuestMode,
      };

      if (isGuestMode) {
        bookingData.guestInfo = {
          name: guestInfo.name,
          email: guestInfo.email,
          phone: guestInfo.phone,
          saveInfo: guestInfo.saveInfo,
        };
      } else if (user) {
        bookingData.clientId = user.id;
      }

      // Create booking via API
      const res = await api.post('/bookings', bookingData);
      const bookingId = res.data._id || res.data.id || res.data.bookingId;

      // Notify stylist
      if (selectedService && selectedDate && selectedTime) {
        const dateStr = selectedDate.toLocaleDateString();
        const clientName = isGuestMode ? guestInfo.name : user?.name || "A client";

        await notifyNewBooking(
          stylistId as string,
          clientName,
          selectedService.name,
          dateStr,
          selectedTime,
          bookingId
        );
      }

      if (!isGuestMode) {
        await updateActivity();
      }

      Toast.show({
        type: "success",
        text1: "Booking confirmed! 🎉",
        text2: isGuestMode
          ? "Check your email for confirmation"
          : "Your appointment has been scheduled",
      });

      // Navigate to guest confirmation or regular confirmation
      setTimeout(() => {
        if (isGuestMode) {
          router.push({
            pathname: "/confirmation",
            params: {
              serviceName: selectedService.name,
              stylistName,
              date: selectedDate.toLocaleDateString(),
              time: selectedTime,
              amount: selectedService.price.toString(),
              isGuest: "true",
              bookingRef,
              guestName: guestInfo.name,
              guestEmail: guestInfo.email,
              bookingId: bookingId || "",
            },
          });
        } else {
          router.push({
            pathname: "/confirmation",
            params: {
              serviceName: selectedService.name,
              stylistName,
              date: selectedDate.toLocaleDateString(),
              time: selectedTime,
              amount: selectedService.price.toString(),
              bookingId: bookingId || "",
            },
          });
        }
      }, 500);
    } catch (err: any) {
      console.error("Booking error:", err);
      Toast.show({
        type: "error",
        text1: "Booking failed",
        text2: err?.response?.data?.message || "Please try again ❌",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderServiceItem = ({ item }: { item: Service }) => {
    const isSelected = selectedService?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
        onPress={() => setSelectedService(item)}
        activeOpacity={0.8}
      >
        <View style={styles.serviceHeader}>
          <Text style={[styles.serviceName, isSelected && styles.serviceTextSelected]}>
            {item.name}
          </Text>
          <Text style={[styles.servicePrice, isSelected && styles.serviceTextSelected]}>
            ${item.price}
          </Text>
        </View>
        <Text style={[styles.serviceDescription, isSelected && styles.serviceTextSelected]}>
          {item.description}
        </Text>
        <View style={styles.serviceFooter}>
          <Text style={[styles.serviceDuration, isSelected && styles.serviceTextSelected]}>
            ⏱ {item.durationMinutes} min
          </Text>
          <Text style={[styles.serviceCategory, isSelected && styles.serviceTextSelected]}>
            {item.category}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedCheckmark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loadingStylist) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E75480" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Text style={styles.stylistName}>{stylistName}</Text>
      </View>

      {/* Auth Selection (if not logged in) */}
      {!isAuthenticated && (
        <View style={styles.authSection}>
          <Text style={styles.authTitle}>How would you like to book?</Text>
          <View style={styles.authOptions}>
            <TouchableOpacity
              style={[styles.authOption, isGuestMode && styles.authOptionSelected]}
              onPress={() => setIsGuestMode(true)}
            >
              <Text style={styles.authOptionIcon}>👤</Text>
              <Text style={[styles.authOptionText, isGuestMode && styles.authOptionTextSelected]}>
                Continue as Guest
              </Text>
              <Text style={styles.authOptionSubtext}>No account needed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authOption, !isGuestMode && styles.authOptionSelected]}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.authOptionIcon}>🔐</Text>
              <Text style={[styles.authOptionText, !isGuestMode && styles.authOptionTextSelected]}>
                Log In
              </Text>
              <Text style={styles.authOptionSubtext}>Manage your bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Guest Info Form */}
      {isGuestMode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={guestInfo.name}
                onChangeText={(text) => setGuestInfo((prev) => ({ ...prev, name: text }))}
                placeholder="John Doe"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={guestInfo.email}
                onChangeText={(text) => setGuestInfo((prev) => ({ ...prev, email: text }))}
                placeholder="john@example.com"
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={guestInfo.phone}
                onChangeText={(text) => setGuestInfo((prev) => ({ ...prev, phone: text }))}
                placeholder="(555) 123-4567"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.saveInfoRow}>
              <Text style={styles.saveInfoText}>Save my info for next time</Text>
              <Switch
                value={guestInfo.saveInfo}
                onValueChange={(value) => setGuestInfo((prev) => ({ ...prev, saveInfo: value }))}
                trackColor={{ false: "#E5E5EA", true: "#E75480" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Text style={styles.guestNotice}>
            📧 We'll email you updates about your appointment
          </Text>
        </View>
      )}

      {/* Section 1: Service Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isGuestMode ? "1. Select a Service" : "1. Select a Service"}
        </Text>
        <FlatList
          data={MOCK_SERVICES}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          scrollEnabled={false}
          contentContainerStyle={styles.servicesList}
        />
      </View>

      {/* Section 2: Calendar Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isGuestMode ? "2. Select a Date" : "2. Select a Date"}
        </Text>
        <CalendarPicker
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          blockedDates={[]}
        />
      </View>

      {/* Section 3: Time Slots */}
      {selectedDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isGuestMode ? "3. Select a Time" : "3. Select a Time"}
          </Text>
          <TimeSlotGrid
            slots={timeSlots}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            loading={loadingSlots}
          />
        </View>
      )}

      {/* Section 4: Booking Summary & Confirm */}
      {selectedService && (
        <View style={[styles.section, styles.summarySection]}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>{selectedService.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{selectedService.durationMinutes} min</Text>
            </View>
            {selectedDate && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{selectedDate.toLocaleDateString()}</Text>
              </View>
            )}
            {selectedTime && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${selectedService.price}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, !canSubmit && styles.confirmButtonDisabled]}
            onPress={handleConfirmBooking}
            disabled={!canSubmit || submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {canSubmit
                  ? isGuestMode
                    ? "Complete Booking as Guest"
                    : "Confirm Booking"
                  : "Select all options"}
              </Text>
            )}
          </TouchableOpacity>

          {isGuestMode && (
            <Text style={styles.termsText}>
              By booking, you agree to receive email confirmations and updates about your
              appointment.
            </Text>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default withOptionalAuth(BookingScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
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
    color: "#2C2C2C",
  },
  stylistName: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  authSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 16,
  },
  authOptions: {
    flexDirection: "row",
    gap: 12,
  },
  authOption: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  authOptionSelected: {
    borderColor: "#E75480",
    backgroundColor: "#FFF5F7",
  },
  authOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  authOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  authOptionTextSelected: {
    color: "#E75480",
  },
  authOptionSubtext: {
    fontSize: 12,
    color: "#8E8E93",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C2C2C",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#2C2C2C",
    backgroundColor: "#F9F9FB",
  },
  saveInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  saveInfoText: {
    fontSize: 14,
    color: "#3A3A3C",
  },
  guestNotice: {
    marginTop: 12,
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: "#E75480",
    backgroundColor: "#E75480",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    flex: 1,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E75480",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceDuration: {
    fontSize: 13,
    color: "#8E8E93",
  },
  serviceCategory: {
    fontSize: 12,
    color: "#8E8E93",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  serviceTextSelected: {
    color: "#fff",
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCheckmark: {
    color: "#E75480",
    fontSize: 14,
    fontWeight: "700",
  },
  summarySection: {
    marginTop: 32,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C2C2C",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E75480",
  },
  confirmButton: {
    marginTop: 24,
    backgroundColor: "#E75480",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#E75480",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#E5E5EA",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  termsText: {
    marginTop: 12,
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
  },
});
