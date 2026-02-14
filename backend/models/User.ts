import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "client" | "stylist" | "admin";
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "stylist", "admin"], default: "client" },
  phone: { type: String },
  profileImage: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index for email lookups
UserSchema.index({ email: 1 });

export default mongoose.model<IUser>("User", UserSchema);
