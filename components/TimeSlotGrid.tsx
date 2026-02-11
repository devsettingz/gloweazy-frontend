/**
 * TimeSlotGrid Component
 * Displays available time slots in a grid for booking selection
 * Matches app styling with white cards, rounded corners, and shadows
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

/** Single time slot data structure */
export interface TimeSlot {
  /** Time display string (e.g., "9:00 AM") */
  time: string;
  /** Whether this slot is available for booking */
  isAvailable: boolean;
}

interface TimeSlotGridProps {
  /** Array of time slots to display */
  slots: TimeSlot[];
  /** Currently selected time string or null */
  selectedTime: string | null;
  /** Callback when user selects a time slot */
  onSelectTime: (time: string) => void;
  /** Loading state for fetching slots */
  loading?: boolean;
  /** Optional empty state message */
  emptyMessage?: string;
}

export default function TimeSlotGrid({
  slots,
  selectedTime,
  onSelectTime,
  loading = false,
  emptyMessage = 'No available time slots',
}: TimeSlotGridProps) {
  // Handle slot press
  const handleSlotPress = (slot: TimeSlot) => {
    if (!slot.isAvailable || loading) return;
    onSelectTime(slot.time);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E75480" />
          <Text style={styles.loadingText}>Loading available slots...</Text>
        </View>
      </View>
    );
  }

  // Render empty state
  if (slots.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🕐</Text>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <Text style={styles.emptySubtext}>
            Please select another date or check back later.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with slot count */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Times</Text>
        <Text style={styles.slotCount}>
          {slots.filter((s) => s.isAvailable).length} slots available
        </Text>
      </View>

      {/* Time slots grid - 3 columns */}
      <View style={styles.grid}>
        {slots.map((slot, index) => {
          const isSelected = selectedTime === slot.time;
          const isDisabled = !slot.isAvailable;

          return (
            <TouchableOpacity
              key={`${slot.time}-${index}`}
              style={[
                styles.slot,
                isSelected && styles.selectedSlot,
                isDisabled && styles.unavailableSlot,
              ]}
              onPress={() => handleSlotPress(slot)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.slotText,
                  isSelected && styles.selectedSlotText,
                  isDisabled && styles.unavailableSlotText,
                ]}
              >
                {slot.time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected time indicator */}
      {selectedTime && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>Selected time:</Text>
          <Text style={styles.selectedTime}>{selectedTime}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  slotCount: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -6,
  },
  slot: {
    width: (width - 80) / 3,
    marginHorizontal: 6,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSlot: {
    backgroundColor: '#E75480',
    borderColor: '#E75480',
  },
  unavailableSlot: {
    backgroundColor: '#F2F2F7',
    borderColor: '#F2F2F7',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  selectedSlotText: {
    color: '#fff',
    fontWeight: '600',
  },
  unavailableSlotText: {
    color: '#C7C7CC',
  },
  selectedContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  selectedTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E75480',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
