import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  searchStylists,
  getStylist,
  createStylistProfile,
  addService,
  getMyServices,
  getServicesById,
  setAvailability,
  getAvailability,
} from "../controllers/stylistController";

const router = Router();

// Public routes
router.get("/search", searchStylists);
router.get("/:id", getStylist);
router.get("/:id/services", getServicesById);

// Protected stylist routes
router.post("/profile", protect, createStylistProfile);
router.post("/services", protect, addService);
router.get("/services/me", protect, getMyServices);
router.post("/availability", protect, setAvailability);
router.get("/availability/me", protect, getAvailability);

export default router;
