import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "credit" | "debit" | "escrow" | "refund" | "payout";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface ITransaction extends Document {
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  reference?: string;
  bookingId?: string;
  paymentMethod?: string;
  metadata?: any;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["credit", "debit", "escrow", "refund", "payout"],
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "GHS" },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending"
  },
  description: { type: String, required: true },
  reference: { type: String },
  bookingId: { type: String },
  paymentMethod: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Indexes
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ bookingId: 1 });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
