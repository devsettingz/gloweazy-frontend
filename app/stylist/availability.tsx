/**
 * Stylist Availability Management
 * Path: /stylist/availability
 * Protected route - stylist role only
 */

import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import withRoleGuard from "../../utils/withRoleGuard";
import api from "../../utils/api";

// Types
interface Break {
  id: string;
  start: string;
  end: string;
}

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  breaks: Break[];
}

interface AvailabilityPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  breaks: { start: string; end: string }[];
}

const DAYS_OF_WEEK = [
  { index: 0, name: "Monday", short: "Mon" },
  { index: 1, name: "Tuesday", short: "Tue" },
  { index: 2, name: "Wednesday", short: "Wed" },
  { index: 3, name: "Thursday", short: "Thu" },
  { index: 4, name: "Friday", short: "Fri" },
  { index: 5, name: "Saturday", short: "Sat" },
  { index: 6, name: "Sunday", short: "Sun" },
];

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "18:00";

function AvailabilityScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [next7Days, setNext7Days] = useState<{ date: Date; dayName: string; isAvailable: boolean }[]>([]);

  // Initialize default schedule
  useEffect(() => {
    const defaultSchedule: DaySchedule[] = DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.index,
      dayName: day.name,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      isWorking: day.index < 5, // Mon-Fri working by default
      breaks: [],
    }));
    setSchedule(defaultSchedule);
    fetchAvailability();
  }, []);

  // Generate next 7 days preview
  useEffect(() => {
    generateNext7Days();
  }, [schedule]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const res = await api.get('/stylist/availability');
      // const data = res.data;
      // if (data.schedule) {
      //   setSchedule(data.schedule);
      // }

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error("Error fetching availability:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load schedule",
        text2: "Using default settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNext7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Get day of week (0 = Monday in our schedule)
      const jsDay = date.getDay(); // 0 = Sunday in JS
      const scheduleDayIndex = jsDay === 0 ? 6 : jsDay - 1;

      const daySchedule = schedule.find((s) => s.dayOfWeek === scheduleDayIndex);
      const isAvailable = daySchedule?.isWorking ?? false;

      days.push({
        date,
        dayName: DAYS_OF_WEEK[scheduleDayIndex].short,
        isAvailable,
      });
    }

    setNext7Days(days);
  };

  const updateDaySchedule = (dayOfWeek: number, updates: Partial<DaySchedule>) => {
    setSchedule((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day))
    );
  };

  const toggleWorking = (dayOfWeek: number) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (day) {
      updateDaySchedule(dayOfWeek, { isWorking: !day.isWorking });
    }
  };

  const addBreak = (dayOfWeek: number) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    // Default break: 12:00 - 13:00
    const newBreak: Break = {
      id: `break_${Date.now()}`,
      start: "12:00",
      end: "13:00",
    };

    updateDaySchedule(dayOfWeek, {
      breaks: [...day.breaks, newBreak],
    });
  };

  const updateBreak = (dayOfWeek: number, breakId: string, field: "start" | "end", value: string) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    const updatedBreaks = day.breaks.map((b) =>
      b.id === breakId ? { ...b, [field]: value } : b
    );

    updateDaySchedule(dayOfWeek, { breaks: updatedBreaks });
  };

  const removeBreak = (dayOfWeek: number, breakId: string) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    updateDaySchedule(dayOfWeek, {
      breaks: day.breaks.filter((b) => b.id !== breakId),
    });
  };

  const copyToAllDays = () => {
    Alert.alert("Copy Schedule", "Apply Monday's schedule to all days?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Copy",
        onPress: () => {
          const monday = schedule.find((d) => d.dayOfWeek === 0);
          if (!monday) return;

          setSchedule((prev) =>
            prev.map((day) =>
              day.dayOfWeek === 0
                ? day
                : {
                    ...day,
                    startTime: monday.startTime,
                    endTime: monday.endTime,
                    isWorking: monday.isWorking,
                    breaks: monday.breaks.map((b) => ({
                      ...b,
                      id: `break_${day.dayOfWeek}_${b.id}`,
                    })),
                  }
            )
          );

          Toast.show({
            type: "success",
            text1: "Schedule copied",
            text2: "Monday's settings applied to all days",
          });
        },
      },
    ]);
  };

  const validateSchedule = (): boolean => {
    for (const day of schedule) {
      if (!day.isWorking) continue;

      // Check start < end
      if (day.startTime >= day.endTime) {
        Toast.show({
          type: "error",
          text1: `Invalid times for ${day.dayName}`,
          text2: "End time must be after start time",
        });
        return false;
      }

      // Validate breaks
      for (const breakItem of day.breaks) {
        if (breakItem.start < day.startTime || breakItem.end > day.endTime) {
          Toast.show({
            type: "error",
            text1: `Invalid break for ${day.dayName}`,
            text2: "Break must be within working hours",
          });
          return false;
        }
        if (breakItem.start >= breakItem.end) {
          Toast.show({
            type: "error",
            text1: `Invalid break for ${day.dayName}`,
            text2: "Break end must be after start",
          });
          return false;
        }
      }
    }
    return true;
  };

  const saveSchedule = async () => {
    if (!validateSchedule()) return;

    try {
      setSaving(true);

      const payload: AvailabilityPayload[] = schedule.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isWorking: day.isWorking,
        breaks: day.breaks.map((b) => ({ start: b.start, end: b.end })),
      }));

      // TODO: Replace with actual API call
      // await api.post('/stylist/availability', { schedule: payload });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      Toast.show({
        type: "success",
        text1: "Schedule saved",
        text2: "Your availability has been updated ✅",
      });
    } catch (err: any) {
      console.error("Save error:", err);
      Toast.show({
        type: "error",
        text1: "Save failed",
        text2: err?.response?.data?.message || "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E75480" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <Text style={styles.headerSubtitle}>Set your working hours</Text>
      </View>

      {/* Weekly Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Hours</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyToAllDays}>
            <Text style={styles.copyButtonText}>📋 Copy to All Days</Text>
          </TouchableOpacity>
        </View>

        {schedule.map((day) => (
          <View key={day.dayOfWeek} style={[styles.dayCard, !day.isWorking && styles.dayCardInactive]}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <View style={styles.dayNameContainer}>
                <Text style={styles.dayName}>{day.dayName}</Text>
                <Text style={styles.dayShort}>{DAYS_OF_WEEK[day.dayOfWeek].short}</Text>
              </View>
              <View style={styles.workingToggle}>
                <Text style={[styles.workingText, !day.isWorking && styles.workingTextInactive]}>
                  {day.isWorking ? "Working" : "Off"}
                </Text>
                <Switch
                  value={day.isWorking}
                  onValueChange={() => toggleWorking(day.dayOfWeek)}
                  trackColor={{ false: "#E5E5EA", true: "#E75480" }}
                  thumbColor={"#fff"}
                />
              </View>
            </View>

            {/* Time Inputs */}
            {day.isWorking && (
              <>
                <View style={styles.timeRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>Start</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={day.startTime}
                      onChangeText={(text) =>
                        updateDaySchedule(day.dayOfWeek, { startTime: text })
                      }
                      placeholder="09:00"
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                    />
                  </View>
                  <Text style={styles.timeSeparator}>→</Text>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>End</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={day.endTime}
                      onChangeText={(text) =>
                        updateDaySchedule(day.dayOfWeek, { endTime: text })
                      }
                      placeholder="18:00"
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                    />
                  </View>
                </View>

                {/* Breaks */}
                {day.breaks.length > 0 && (
                  <View style={styles.breaksContainer}>
                    <Text style={styles.breaksLabel}>Breaks</Text>
                    {day.breaks.map((breakItem) => (
                      <View key={breakItem.id} style={styles.breakRow}>
                        <View style={styles.breakTimeContainer}>
                          <TextInput
                            style={styles.breakInput}
                            value={breakItem.start}
                            onChangeText={(text) =>
                              updateBreak(day.dayOfWeek, breakItem.id, "start", text)
                            }
                            maxLength={5}
                          />
                          <Text style={styles.breakSeparator}>-</Text>
                          <TextInput
                            style={styles.breakInput}
                            value={breakItem.end}
                            onChangeText={(text) =>
                              updateBreak(day.dayOfWeek, breakItem.id, "end", text)
                            }
                            maxLength={5}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.removeBreakButton}
                          onPress={() => removeBreak(day.dayOfWeek, breakItem.id)}
                        >
                          <Text style={styles.removeBreakText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Break Button */}
                <TouchableOpacity
                  style={styles.addBreakButton}
                  onPress={() => addBreak(day.dayOfWeek)}
                >
                  <Text style={styles.addBreakText}>+ Add Break</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </View>

      {/* Calendar Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next 7 Days Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewGrid}>
            {next7Days.map((day, index) => (
              <View key={index} style={styles.previewDay}>
                <Text style={styles.previewDayName}>{day.dayName}</Text>
                <Text style={styles.previewDate}>{day.date.getDate()}</Text>
                <View
                  style={[
                    styles.previewIndicator,
                    day.isAvailable ? styles.previewAvailable : styles.previewUnavailable,
                  ]}
                >
                  <Text style={styles.previewStatus}>
                    {day.isAvailable ? "✓" : "✕"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveSchedule}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Schedule</Text>
        )}
      </TouchableOpacity>

      {/* Bottom spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default withRoleGuard(AvailabilityScreen, "stylist");

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
  headerSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  copyButton: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#E75480",
  },
  dayCard: {
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
  dayCardInactive: {
    opacity: 0.7,
    backgroundColor: "#FAFAFA",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dayNameContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  dayShort: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 6,
  },
  workingToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  workingText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#34C759",
  },
  workingTextInactive: {
    color: "#8E8E93",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#2C2C2C",
    textAlign: "center",
    backgroundColor: "#F9F9FB",
  },
  timeSeparator: {
    fontSize: 18,
    color: "#8E8E93",
    fontWeight: "600",
  },
  breaksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  breaksLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  breakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  breakTimeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "#F9F9FB",
  },
  breakSeparator: {
    fontSize: 14,
    color: "#8E8E93",
  },
  removeBreakButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFEBEB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  removeBreakText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
  },
  addBreakButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E75480",
    borderStyle: "dashed",
    alignItems: "center",
  },
  addBreakText: {
    color: "#E75480",
    fontSize: 14,
    fontWeight: "500",
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  previewDay: {
    alignItems: "center",
    flex: 1,
  },
  previewDayName: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  previewDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  previewIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  previewAvailable: {
    backgroundColor: "#34C759",
  },
  previewUnavailable: {
    backgroundColor: "#E5E5EA",
  },
  previewStatus: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 32,
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
