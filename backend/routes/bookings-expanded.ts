import { Router, Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// GET /bookings - List bookings
router.get("/", protect, async (req: Request, res: Response) => {
  res.json({ bookings: [] });
});

// GET /bookings/disputes
router.get("/disputes", protect, async (req: Request, res: Response) => {
  res.json({ disputes: [] });
});

// GET /bookings/:id
router.get("/:id", protect, async (req: Request, res: Response) => {
  res.json({ booking: {} });
});

// POST /bookings
router.post("/", async (req: Request, res: Response) => {
  res.json({ message: "Booking created" });
});

// PATCH /bookings/:id/status
router.patch("/:id/status", protect, async (req: Request, res: Response) => {
  res.json({ message: "Status updated" });
});

export default router;
