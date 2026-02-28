import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { adminOnly } from "../middleware/adminMiddleware";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllStylists,
  approveStylist,
  featureStylist,
  getAllBookings,
  updateBookingStatus,
  getAllTransactions,
  getRevenueReport,
  adjustWallet,
  getSystemSettings,
  updateSystemSettings,
  sendAnnouncement,
  getAuditLog
} from "../controllers/adminController";

const router = Router();

// Apply auth and admin middleware to all routes
router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.post("/users/:id/reset-password", resetUserPassword);

// Stylist Management
router.get("/stylists", getAllStylists);
router.post("/stylists/:id/approve", approveStylist);
router.post("/stylists/:id/feature", featureStylist);

// Booking Management
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

// Financial Management
router.get("/transactions", getAllTransactions);
router.get("/revenue", getRevenueReport);
router.post("/wallet/adjust", adjustWallet);

// System Settings
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);

// Communications
router.post("/announcements", sendAnnouncement);

// Audit
router.get("/audit-log", getAuditLog);

export default router;
