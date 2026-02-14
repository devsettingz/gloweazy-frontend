import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createBooking,
  getMyBookings,
  getStylistBookings,
  getBooking,
  updateBookingStatus,
  createDispute,
  resolveDispute,
  getDisputes,
  getAvailableSlots,
} from "../controllers/bookingController";

const router = Router();

// Bookings
router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.get("/stylist", protect, getStylistBookings);
router.get("/disputes", protect, getDisputes);
router.get("/slots", protect, getAvailableSlots);
router.get("/:id", protect, getBooking);
router.patch("/:id/status", protect, updateBookingStatus);
router.post("/:id/dispute", protect, createDispute);
router.patch("/:id/resolve", protect, resolveDispute);

export default router;
