/**
 * CalendarPicker Component
 * A custom month view calendar for selecting dates
 * Matches app styling with white cards, rounded corners, and shadows
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CalendarPickerProps {
  /** Currently selected date or null */
  selectedDate: Date | null;
  /** Callback when user confirms date selection */
  onSelectDate: (date: Date) => void;
  /** Array of blocked dates in YYYY-MM-DD format */
  blockedDates?: string[];
}

interface DayInfo {
  date: number;
  fullDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isBlocked: boolean;
  dateString: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPicker({
  selectedDate,
  onSelectDate,
  blockedDates = [],
}: CalendarPickerProps) {
  // Start with current month, or selected date's month if provided
  const initialDate = selectedDate || new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(selectedDate);

  const today = useMemo(() => new Date(), []);
  today.setHours(0, 0, 0, 0);

  // Format date to YYYY-MM-DD for comparison
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate calendar days for current month view
  const calendarDays = useMemo((): DayInfo[] => {
    const days: DayInfo[] = [];
    
    // First day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Last day of current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Days from previous month to fill the first week
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const prevMonth = new Date(currentYear, currentMonth, 0);
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i);
      const dateString = formatDateString(date);
      days.push({
        date: date.getDate(),
        fullDate: date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        isBlocked: blockedDates.includes(dateString),
        dateString,
      });
    }
    
    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateString = formatDateString(date);
      days.push({
        date: i,
        fullDate: date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        isBlocked: blockedDates.includes(dateString),
        dateString,
      });
    }
    
    // Days from next month to complete the grid (6 rows x 7 columns = 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      const dateString = formatDateString(date);
      days.push({
        date: i,
        fullDate: date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        isBlocked: blockedDates.includes(dateString),
        dateString,
      });
    }
    
    return days;
  }, [currentMonth, currentYear, blockedDates, today]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Check if a day is selected
  const isSelected = (day: DayInfo): boolean => {
    if (!tempSelectedDate) return false;
    return day.dateString === formatDateString(tempSelectedDate);
  };

  // Handle day press
  const handleDayPress = (day: DayInfo) => {
    if (day.isPast || day.isBlocked || !day.isCurrentMonth) return;
    setTempSelectedDate(day.fullDate);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (tempSelectedDate) {
      onSelectDate(tempSelectedDate);
    }
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled = !tempSelectedDate;

  return (
    <View style={styles.container}>
      {/* Header with month/year and navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={goToPreviousMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthYearText}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        
        <TouchableOpacity 
          onPress={goToNextMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Days of week header */}
      <View style={styles.daysOfWeekContainer}>
        {DAYS_OF_WEEK.map((day) => (
          <Text key={day} style={styles.dayOfWeekText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const selected = isSelected(day);
          const disabled = day.isPast || day.isBlocked || !day.isCurrentMonth;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                selected && styles.selectedDayCell,
                day.isToday && !selected && styles.todayCell,
                disabled && styles.disabledDayCell,
              ]}
              onPress={() => handleDayPress(day)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  selected && styles.selectedDayText,
                  day.isToday && !selected && styles.todayText,
                  disabled && styles.disabledDayText,
                  !day.isCurrentMonth && styles.otherMonthDayText,
                ]}
              >
                {day.date}
              </Text>
              {day.isBlocked && day.isCurrentMonth && (
                <View style={styles.blockedIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected date display */}
      {tempSelectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateLabel}>Selected:</Text>
          <Text style={styles.selectedDateText}>
            {tempSelectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      )}

      {/* Confirm button */}
      <TouchableOpacity
        style={[styles.confirmButton, isConfirmDisabled && styles.confirmButtonDisabled]}
        onPress={handleConfirm}
        disabled={isConfirmDisabled}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmButtonText}>
          {isConfirmDisabled ? 'Select a Date' : 'Confirm'}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#2C2C2C',
    lineHeight: 28,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 80) / 7,
    height: (width - 80) / 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  selectedDayCell: {
    backgroundColor: '#E75480',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#E75480',
  },
  disabledDayCell: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayText: {
    color: '#E75480',
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#C7C7CC',
  },
  otherMonthDayText: {
    color: '#C7C7CC',
  },
  blockedIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
  },
  selectedDateContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F9F9FB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginRight: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
    flex: 1,
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#E75480',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
