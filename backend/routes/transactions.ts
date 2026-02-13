import { Router, Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// GET /transactions/:userId
router.get("/:userId", protect, async (req: Request, res: Response) => {
  res.json({ transactions: [] });
});

export default router;
