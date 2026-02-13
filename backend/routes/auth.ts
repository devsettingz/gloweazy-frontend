import { Router, Request, Response } from "express";
import {
    forgotPassword,
    login,
    resetPassword,
    signup,
    updateProfile,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// 🔐 Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ✅ Protected test route
router.get("/me", protect, (req: Request, res: Response) => {
  res.json({ message: "Authenticated user", user: req.user });
});

// ✅ Update profile
router.post("/profile", protect, updateProfile);

export default router;
