import mongoose, { Document, Schema } from "mongoose";

export interface IService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: string;
}

export interface IAvailability {
  day: string; // Monday, Tuesday, etc.
  slots: string[]; // ["09:00", "10:00", "11:00"]
}

export interface IStylist extends Document {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  specialty: string[];
  services: IService[];
  availability: IAvailability[];
  location?: {
    address: string;
    city: string;
    coordinates?: [number, number]; // [lat, lng]
  };
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: Date;
}

const ServiceSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  category: { type: String },
});

const AvailabilitySchema: Schema = new Schema({
  day: { type: String, required: true },
  slots: [{ type: String }],
});

const StylistSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  specialty: [{ type: String }],
  services: [ServiceSchema],
  availability: [AvailabilitySchema],
  location: {
    address: { type: String },
    city: { type: String },
    coordinates: { type: [Number] },
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

// Index for search
StylistSchema.index({ name: "text", specialty: "text", "location.city": "text" });
StylistSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.model<IStylist>("Stylist", StylistSchema);
