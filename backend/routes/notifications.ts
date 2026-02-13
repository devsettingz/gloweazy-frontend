import { Router, Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// POST /users/push-token
router.post("/push-token", protect, async (req: Request, res: Response) => {
  res.json({ message: "Token registered" });
});

// DELETE /users/push-token
router.delete("/push-token", protect, async (req: Request, res: Response) => {
  res.json({ message: "Token removed" });
});

// POST /notifications/send
router.post("/send", protect, async (req: Request, res: Response) => {
  res.json({ message: "Notification sent" });
});

export default router;
