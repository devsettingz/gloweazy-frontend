/**
 * Notification Helper Functions
 * High-level notification utilities for common app scenarios
 */

import * as Notifications from 'expo-notifications';
import api from './api';

/**
 * Schedule a booking reminder notification
 * Triggers 24 hours before the booking and 1 hour before
 */
export async function scheduleBookingReminder(
  bookingDate: string,
  serviceName: string,
  stylistName: string
): Promise<string[]> {
  const identifiers: string[] = [];
  const bookingDateTime = new Date(bookingDate);
  const now = new Date();

  // Schedule 24-hour reminder (if booking is more than 24 hours away)
  const reminder24h = new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000);
  if (reminder24h > now) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Upcoming Appointment Tomorrow',
        body: `Your ${serviceName} with ${stylistName} is tomorrow!`,
        data: { type: 'booking-reminder', hoursBefore: 24 },
        sound: 'default',
      },
      trigger: { date: reminder24h },
    });
    identifiers.push(id);
  }

  // Schedule 1-hour reminder (if booking is more than 1 hour away)
  const reminder1h = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);
  if (reminder1h > now) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Appointment in 1 Hour',
        body: `Your ${serviceName} with ${stylistName} starts soon!`,
        data: { type: 'booking-reminder', hoursBefore: 1 },
        sound: 'default',
      },
      trigger: { date: reminder1h },
    });
    identifiers.push(id);
  }

  return identifiers;
}

/**
 * Notify stylist of a new booking
 * Sends push notification to stylist's device
 */
export async function notifyNewBooking(
  stylistId: string,
  clientName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string,
  bookingId?: string
): Promise<boolean> {
  try {
    // Send to backend which will push to stylist's device
    await api.post('/notifications/send', {
      userId: stylistId,
      title: '🎉 New Booking!',
      body: `${clientName} booked ${serviceName} for ${bookingDate} at ${bookingTime}`,
      data: {
        type: 'new-booking',
        action: 'view-booking',
        bookingId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending new booking notification:', error);
    return false;
  }
}

/**
 * Notify client of booking confirmation
 */
export async function notifyBookingConfirmed(
  clientId: string,
  stylistName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string
): Promise<boolean> {
  try {
    await api.post('/notifications/send', {
      userId: clientId,
      title: '✅ Booking Confirmed',
      body: `Your ${serviceName} with ${stylistName} is confirmed for ${bookingDate} at ${bookingTime}`,
      data: {
        type: 'booking-confirmed',
        action: 'view-booking',
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
}

/**
 * Notify about dispute status update
 * Used when admin resolves a dispute
 */
export async function notifyDisputeUpdate(
  userId: string,
  status: 'confirmed' | 'cancelled',
  bookingId: string,
  serviceName: string
): Promise<boolean> {
  try {
    const title = status === 'confirmed' ? '✅ Dispute Resolved' : '❌ Booking Cancelled';
    const body = status === 'confirmed'
      ? `Your dispute for ${serviceName} was resolved in your favor. Payment released!`
      : `Your dispute for ${serviceName} was reviewed. You will receive a refund.`;

    await api.post('/notifications/send', {
      userId,
      title,
      body,
      data: {
        type: 'dispute-update',
        status,
        bookingId,
        action: 'view-dispute',
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending dispute update notification:', error);
    return false;
  }
}

/**
 * Notify both client and stylist about dispute resolution
 */
export async function notifyDisputeResolved(
  clientId: string,
  stylistId: string,
  resolution: 'confirmed' | 'cancelled',
  bookingId: string,
  serviceName: string
): Promise<{ clientNotified: boolean; stylistNotified: boolean }> {
  const [clientNotified, stylistNotified] = await Promise.all([
    notifyDisputeUpdate(clientId, resolution, bookingId, serviceName),
    notifyDisputeUpdate(stylistId, resolution, bookingId, serviceName),
  ]);

  return { clientNotified, stylistNotified };
}

/**
 * Notify about payout received
 */
export async function notifyPayoutReceived(
  userId: string,
  amount: number
): Promise<boolean> {
  try {
    await api.post('/notifications/send', {
      userId,
      title: '💰 Payout Processed',
      body: `$${amount.toFixed(2)} has been transferred to your account.`,
      data: {
        type: 'payout',
        action: 'view-wallet',
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending payout notification:', error);
    return false;
  }
}

/**
 * Notify about new message/chat
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  messagePreview: string
): Promise<boolean> {
  try {
    await api.post('/notifications/send', {
      userId: recipientId,
      title: `💬 New message from ${senderName}`,
      body: messagePreview.slice(0, 100) + (messagePreview.length > 100 ? '...' : ''),
      data: {
        type: 'message',
        action: 'view-chat',
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending message notification:', error);
    return false;
  }
}

/**
 * Cancel all booking reminders for a specific booking
 */
export async function cancelBookingReminders(bookingId: string): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as Record<string, any> | undefined;
      if (data?.bookingId === bookingId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling booking reminders:', error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}
