import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { showError, showSuccess } from '../../utils/toast';

// ✅ Typed booking model
type Booking = {
  id: string;
  service: string;
  clientName: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
};

export default function StylistBookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get(`/bookings/stylist/${user?.id}`);
      const data = res.data.bookings ?? res.data;
      setBookings(data);
    } catch (err) {
      showError('Error fetching bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const now = new Date();
  const upcomingBookings = bookings.filter((b) => new Date(b.date) > now);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: '#4CAF50' };
      case 'pending':
        return { backgroundColor: '#FFC107' };
      case 'rejected':
        return { backgroundColor: '#F44336' };
      default:
        return { backgroundColor: '#9E9E9E' };
    }
  };

  const rescheduleBooking = async (id: string, newDateISO: string) => {
    try {
      setRescheduleLoading(true);
      await api.put(`/bookings/${id}/reschedule`, { date: newDateISO });
      showSuccess('Booking rescheduled successfully ✅');
      fetchBookings();
    } catch (err) {
      showError('Reschedule failed ❌');
      console.error('Error rescheduling:', err);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const confirmReschedule = async () => {
    if (selectedBooking) {
      await rescheduleBooking(selectedBooking.id, newDate.toISOString());
      setShowReschedule(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Stylist Upcoming Bookings ✂️</Text>

      {loading ? (
        <LoadingOverlay message="Loading bookings..." />
      ) : upcomingBookings.length === 0 ? (
        <Text style={styles.subtitle}>No upcoming bookings</Text>
      ) : (
        upcomingBookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.cardTitle}>{b.service}</Text>
            <Text style={styles.cardText}>Client: {b.clientName}</Text>
            <Text style={styles.cardText}>
              Date: {new Date(b.date).toLocaleDateString()} —{' '}
              {new Date(b.date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <View style={[styles.badge, getStatusStyle(b.status)]}>
              <Text style={styles.badgeText}>{b.status.toUpperCase()}</Text>
            </View>

            <TouchableOpacity
              style={styles.buttonReschedule}
              onPress={() => {
                setSelectedBooking(b);
                setNewDate(new Date(b.date));
                setShowReschedule(true);
              }}
            >
              <Text style={styles.buttonText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* ✅ Reschedule Modal */}
      <Modal visible={showReschedule} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Booking</Text>

            {rescheduleLoading ? (
              <LoadingOverlay message="Rescheduling booking..." />
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.modalButton}>Pick Date</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={newDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event: any, selectedDate: Date | undefined) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const updated = new Date(newDate);
                        updated.setFullYear(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          selectedDate.getDate()
                        );
                        setNewDate(updated);
                      }
                    }}
                  />
                )}

                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.modalButton}>Pick Time</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={newDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event: any, selectedTime: Date | undefined) => {
                      setShowTimePicker(false);
                      if (selectedTime) {
                        const updated = new Date(newDate);
                        updated.setHours(
                          selectedTime.getHours(),
                          selectedTime.getMinutes()
                        );
                        setNewDate(updated);
                      }
                    }}
                  />
                )}

                <TouchableOpacity onPress={confirmReschedule}>
                  <Text style={styles.modalButton}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowReschedule(false)}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFFFFF' },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E75480',
    marginBottom: 8,
  },
  cardText: { color: '#2C2C2C', fontSize: 14, marginBottom: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  buttonReschedule: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButton: {
    backgroundColor: '#E75480',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 6,
    fontWeight: '600',
  },
});
