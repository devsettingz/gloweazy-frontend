/**
 * Booking-related TypeScript interfaces
 * Used across the booking system for clients, stylists, and admins
 */

/**
 * Service offered by a stylist
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  stylistId: string;
  category: string;
  imageUrl?: string;
}

/**
 * Time slot for stylist availability
 * References a booking when isBooked is true
 */
export interface AvailabilitySlot {
  id: string;
  stylistId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isBooked: boolean;
  bookingId?: string; // Optional reference to the booking
}

/**
 * Booking status enum values
 */
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';

/**
 * Payment status for bookings
 */
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'disputed';

/**
 * Main Booking interface
 * Represents a booking between a client and stylist for a service
 */
export interface Booking {
  id: string;
  clientId: string;
  stylistId: string;
  serviceId: string;
  status: BookingStatus;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  createdAt: string; // ISO timestamp
  disputeReason?: string; // Only present when status is 'disputed'
  paymentStatus: PaymentStatus;
}

/**
 * DTO for creating a new booking
 * Used when a client initiates a booking request
 */
export interface CreateBookingDTO {
  clientId: string;
  stylistId: string;
  serviceId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm format
}
