import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

// Route imports
import authRoutes from "./routes/auth";
import bookingRoutes from "./routes/bookings";
import stylistRoutes from "./routes/stylists";
import walletRoutes from "./routes/wallet";
import notificationRoutes from "./routes/notifications";
import transactionsRoutes from "./routes/transactions";
import storeRoutes from "./routes/store";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gloweazy";

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ROUTES
// ============================================

// Auth routes
app.use("/auth", authRoutes);

// Booking routes (core transaction system)
app.use("/bookings", bookingRoutes);

// Stylist routes (services, availability, search)
app.use("/stylist", stylistRoutes);
app.use("/stylists", stylistRoutes);

// Wallet routes (balance, escrow, payouts)
app.use("/wallet", walletRoutes);

// Notification routes (push tokens, sending)
app.use("/notifications", notificationRoutes);
app.use("/users", notificationRoutes);

// Transaction routes (receipts, history)
app.use("/transactions", transactionsRoutes);

// Store routes (products)
app.use("/store", storeRoutes);

// ============================================
// HEALTH & STATUS
// ============================================

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Gloweazy backend is running 🚀");
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "OK", 
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API Documentation route
app.get("/api/routes", (req: Request, res: Response) => {
  res.json({
    auth: {
      "POST /auth/login": "Login user",
      "POST /auth/signup": "Register user",
      "GET /auth/me": "Get current user (protected)",
    },
    bookings: {
      "GET /bookings": "List bookings (protected)",
      "GET /bookings/disputes": "List disputed bookings (admin only)",
      "GET /bookings/:id": "Get single booking (protected)",
      "POST /bookings": "Create booking (supports guest)",
      "PATCH /bookings/:id/status": "Update booking status",
      "POST /bookings/:id/dispute": "Create dispute",
      "PATCH /bookings/:id/resolve": "Resolve dispute (admin only)",
      "GET /bookings/availability": "Get available slots",
    },
    stylists: {
      "POST /stylist/services": "Create service (stylist only)",
      "GET /stylist/services": "List my services",
      "PUT /stylist/services/:id": "Update service",
      "DELETE /stylist/services/:id": "Delete service",
      "POST /stylist/availability": "Set availability",
      "GET /stylist/availability": "Get my availability",
      "GET /stylists/search": "Search stylists",
      "GET /stylists/:id": "Get stylist profile",
    },
    wallet: {
      "GET /wallet/balance": "Get wallet balance",
      "GET /wallet/transactions": "List transactions",
      "POST /wallet/escrow/hold": "Hold funds in escrow",
      "POST /wallet/escrow/release": "Release escrow",
      "POST /wallet/payout": "Withdraw to bank",
      "POST /wallet/topup": "Add funds (testing)",
    },
    notifications: {
      "POST /users/push-token": "Register push token",
      "DELETE /users/push-token": "Remove push token",
      "POST /notifications/send": "Send notification",
      "POST /notifications/send-multiple": "Bulk send (admin)",
      "GET /notifications/history": "Get my notification history",
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

(async () => {
  try {
    await connectDB(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/routes`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
})();
