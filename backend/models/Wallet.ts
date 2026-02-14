import mongoose, { Document, Schema } from "mongoose";

export interface IWallet extends Document {
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: "GHS" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IWallet>("Wallet", WalletSchema);
