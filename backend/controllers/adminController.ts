import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Stylist from "../models/Stylist";
import Booking from "../models/Booking";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import mongoose from "mongoose";

// ============================================
// ANALYTICS & DASHBOARD
// ============================================

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // User stats
    const totalUsers = await User.countDocuments({ role: { $in: ["client", "stylist"] } });
    const totalClients = await User.countDocuments({ role: "client" });
    const totalStylists = await User.countDocuments({ role: "stylist" });
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Booking stats
    const totalBookings = await Booking.countDocuments();
    const bookingsToday = await Booking.countDocuments({ createdAt: { $gte: startOfDay } });
    const bookingsThisMonth = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });

    // Financial stats
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: "credit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const revenueToday = await Transaction.aggregate([
      { $match: { type: "credit", status: "completed", createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const revenueThisMonth = await Transaction.aggregate([
      { $match: { type: "credit", status: "completed", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Wallet stats
    const totalWalletBalance = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    // Recent activity
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("clientId", "name email")
      .populate("stylistId", "name");

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email");

    // Top stylists
    const topStylists = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$stylistId", bookings: { $sum: 1 }, revenue: { $sum: "$servicePrice" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      users: {
        total: totalUsers,
        clients: totalClients,
        stylists: totalStylists,
        newToday: newUsersToday,
        active: activeUsers
      },
      bookings: {
        total: totalBookings,
        today: bookingsToday,
        thisMonth: bookingsThisMonth,
        pending: pendingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      },
      finance: {
        totalRevenue: totalRevenue[0]?.total || 0,
        today: revenueToday[0]?.total || 0,
        thisMonth: revenueThisMonth[0]?.total || 0,
        totalWalletBalance: totalWalletBalance[0]?.total || 0
      },
      recent: {
        bookings: recentBookings,
        transactions: recentTransactions
      },
      topStylists
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to get users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get additional data based on role
    let additionalData = {};
    if (user.role === "stylist") {
      const stylist = await Stylist.findOne({ userId: user._id });
      const bookings = await Booking.countDocuments({ stylistId: user._id });
      additionalData = { stylistProfile: stylist, totalBookings: bookings };
    } else {
      const bookings = await Booking.countDocuments({ clientId: user._id });
      additionalData = { totalBookings: bookings };
    }

    res.json({ user, ...additionalData });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "client",
      phone
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Soft delete - deactivate instead of hard delete
    user.isActive = false;
    await user.save();

    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

// ============================================
// STYLIST MANAGEMENT
// ============================================

export const getAllStylists = async (req: Request, res: Response) => {
  try {
    const { approved, search, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (approved !== undefined) query.isApproved = approved === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialty: { $in: [new RegExp(search as string, "i")] } }
      ];
    }

    const stylists = await Stylist.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await Stylist.countDocuments(query);

    res.json({
      stylists,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (err) {
    console.error("Get stylists error:", err);
    res.status(500).json({ error: "Failed to get stylists" });
  }
};

export const approveStylist = async (req: Request, res: Response) => {
  try {
    const stylist = await Stylist.findById(req.params.id);
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }

    stylist.isApproved = true;
    await stylist.save();

    res.json({ message: "Stylist approved successfully" });
  } catch (err) {
    console.error("Approve stylist error:", err);
    res.status(500).json({ error: "Failed to approve stylist" });
  }
};

export const featureStylist = async (req: Request, res: Response) => {
  try {
    const { featured } = req.body;
    const stylist = await Stylist.findById(req.params.id);
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }

    (stylist as any).isFeatured = featured;
    await stylist.save();

    res.json({ message: `Stylist ${featured ? "featured" : "unfeatured"} successfully` });
  } catch (err) {
    console.error("Feature stylist error:", err);
    res.status(500).json({ error: "Failed to update stylist" });
  }
};

// ============================================
// BOOKING MANAGEMENT
// ============================================

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string))
      .populate("clientId", "name email phone")
      .populate("stylistId", "name email");

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Failed to get bookings" });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
};

// ============================================
// FINANCIAL MANAGEMENT
// ============================================

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string))
      .populate("userId", "name email");

    const total = await Transaction.countDocuments(query);

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

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;
    
    const match: any = { type: "credit", status: "completed" };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate as string);
      if (endDate) match.createdAt.$lte = new Date(endDate as string);
    }

    let groupFormat: any;
    switch (groupBy) {
      case "month":
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      case "year":
        groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
      case "day":
      default:
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const revenue = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupFormat,
          amount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ revenue });
  } catch (err) {
    console.error("Revenue report error:", err);
    res.status(500).json({ error: "Failed to get revenue report" });
  }
};

export const adjustWallet = async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    wallet.balance += parseFloat(amount);
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      userId,
      type: amount > 0 ? "credit" : "debit",
      amount: Math.abs(parseFloat(amount)),
      currency: "GHS",
      status: "completed",
      description: `Admin adjustment: ${reason}`,
      note: `Adjusted by admin: ${req.user?.email}`
    });

    res.json({ 
      message: "Wallet adjusted successfully",
      newBalance: wallet.balance
    });
  } catch (err) {
    console.error("Adjust wallet error:", err);
    res.status(500).json({ error: "Failed to adjust wallet" });
  }
};

// ============================================
// SYSTEM SETTINGS
// ============================================

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    // Return system configuration
    const settings = {
      platformFee: process.env.PLATFORM_FEE || "10",
      minWithdrawal: process.env.MIN_WITHDRAWAL || "50",
      maxWithdrawal: process.env.MAX_WITHDRAWAL || "10000",
      bookingCancellationFee: process.env.CANCELLATION_FEE || "5",
      autoApproveStylists: process.env.AUTO_APPROVE_STYLISTS === "true",
      maintenanceMode: process.env.MAINTENANCE_MODE === "true",
      supportedPaymentMethods: ["card", "mobile_money", "wallet"],
      supportedCurrencies: ["GHS", "USD"],
      defaultCurrency: "GHS"
    };

    res.json({ settings });
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ error: "Failed to get settings" });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    // In a real app, save to database
    // For now, just return success
    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

// ============================================
// CONTENT MANAGEMENT
// ============================================

export const sendAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, message, target = "all" } = req.body;

    // In a real app, send notifications/emails to users
    // For now, just log it
    console.log(`Announcement to ${target}: ${title} - ${message}`);

    res.json({ message: "Announcement sent successfully" });
  } catch (err) {
    console.error("Send announcement error:", err);
    res.status(500).json({ error: "Failed to send announcement" });
  }
};

// ============================================
// AUDIT LOG
// ============================================

export const getAuditLog = async (req: Request, res: Response) => {
  try {
    // In a real app, fetch from audit log collection
    res.json({ 
      message: "Audit log endpoint - implement with audit collection",
      logs: []
    });
  } catch (err) {
    console.error("Get audit log error:", err);
    res.status(500).json({ error: "Failed to get audit log" });
  }
};
