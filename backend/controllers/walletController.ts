import { Request, Response } from "express";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import Booking from "../models/Booking";

// Get wallet balance
export const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }
    
    // Get recent transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ 
      balance: wallet.balance,
      currency: wallet.currency,
      transactions 
    });
  } catch (err) {
    console.error("Get balance error:", err);
    res.status(500).json({ error: "Failed to get balance" });
  }
};

// Top up wallet
export const topUp = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, method, reference } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }
    
    // In production, verify payment with provider (Paystack, Flutterwave, etc.)
    // For now, simulate successful payment
    
    wallet.balance += parseFloat(amount);
    await wallet.save();
    
    const transaction = await Transaction.create({
      userId,
      type: "credit",
      amount: parseFloat(amount),
      currency: "GHS",
      status: "completed",
      description: `Wallet top-up via ${method}`,
      reference,
      paymentMethod: method,
    });
    
    res.json({ 
      message: "Wallet topped up successfully",
      balance: wallet.balance,
      transaction 
    });
  } catch (err) {
    console.error("Top up error:", err);
    res.status(500).json({ error: "Failed to top up wallet" });
  }
};

// Get transaction history
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
    
    const total = await Transaction.countDocuments({ userId });
    
    res.json({ 
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ error: "Failed to get transactions" });
  }
};

// Hold funds in escrow for booking
export const holdEscrow = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    if (booking.clientId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < booking.servicePrice) {
      return res.status(400).json({ 
        error: "Insufficient balance",
        required: booking.servicePrice,
        available: wallet?.balance || 0
      });
    }
    
    // Duct from wallet
    wallet.balance -= booking.servicePrice;
    await wallet.save();
    
    // Update booking
    booking.paymentStatus = "held_in_escrow";
    await booking.save();
    
    // Create transaction
    const transaction = await Transaction.create({
      userId,
      type: "escrow",
      amount: -booking.servicePrice,
      currency: "GHS",
      status: "completed",
      description: `Escrow hold for ${booking.serviceName}`,
      bookingId,
    });
    
    res.json({ 
      message: "Funds held in escrow",
      balance: wallet.balance,
      transaction 
    });
  } catch (err) {
    console.error("Hold escrow error:", err);
    res.status(500).json({ error: "Failed to hold escrow" });
  }
};

// Release escrow to stylist
export const releaseEscrow = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    if (booking.paymentStatus !== "held_in_escrow") {
      return res.status(400).json({ error: "No escrow to release" });
    }
    
    // Find stylist wallet
    const Stylist = require("../models/Stylist").default;
    const stylist = await Stylist.findById(booking.stylistId);
    
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }
    
    // Credit stylist wallet
    let stylistWallet = await Wallet.findOne({ userId: stylist.userId });
    if (!stylistWallet) {
      stylistWallet = await Wallet.create({ userId: stylist.userId, balance: 0 });
    }
    stylistWallet.balance += booking.servicePrice;
    await stylistWallet.save();
    
    // Update booking
    booking.paymentStatus = "released_to_stylist";
    booking.status = "completed";
    await booking.save();
    
    // Create transaction for stylist
    await Transaction.create({
      userId: stylist.userId,
      type: "credit",
      amount: booking.servicePrice,
      currency: "GHS",
      status: "completed",
      description: `Payment for ${booking.serviceName}`,
      bookingId,
    });
    
    res.json({ 
      message: "Escrow released to stylist",
      booking 
    });
  } catch (err) {
    console.error("Release escrow error:", err);
    res.status(500).json({ error: "Failed to release escrow" });
  }
};

// Request payout (for stylists)
export const requestPayout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, bankAccount } = req.body;
    
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    // In production, integrate with bank/payment provider
    // For now, just record the transaction
    
    wallet.balance -= amount;
    await wallet.save();
    
    const transaction = await Transaction.create({
      userId,
      type: "payout",
      amount: -amount,
      currency: "GHS",
      status: "completed", // Would be "pending" in real scenario
      description: `Payout to bank account`,
      metadata: { bankAccount },
    });
    
    res.json({ 
      message: "Payout processed",
      balance: wallet.balance,
      transaction 
    });
  } catch (err) {
    console.error("Payout error:", err);
    res.status(500).json({ error: "Failed to process payout" });
  }
};
