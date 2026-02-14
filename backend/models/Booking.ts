import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus = 
  | "pending" 
  | "confirmed" 
  | "in_progress" 
  | "completed" 
  | "cancelled" 
  | "disputed";

export type PaymentStatus = 
  | "pending" 
  | "held_in_escrow" 
  | "released_to_stylist" 
  | "refunded_to_client";

export interface IBooking extends Document {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  stylistId: string;
  stylistName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  bookingDate: Date;
  timeSlot: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  location?: string;
  notes?: string;
  disputeReason?: string;
  disputeResolution?: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String },
  stylistId: { type: String, required: true },
  stylistName: { type: String, required: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  servicePrice: { type: Number, required: true },
  serviceDuration: { type: Number, required: true },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "disputed"],
    default: "pending"
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "held_in_escrow", "released_to_stylist", "refunded_to_client"],
    default: "pending"
  },
  location: { type: String },
  notes: { type: String },
  disputeReason: { type: String },
  disputeResolution: { type: String },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date },
  },
}, { timestamps: true });

// Indexes
BookingSchema.index({ clientId: 1, status: 1 });
BookingSchema.index({ stylistId: 1, status: 1 });
BookingSchema.index({ bookingDate: 1 });

export default mongoose.model<IBooking>("Booking", BookingSchema);
