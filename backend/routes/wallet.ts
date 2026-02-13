import { Router, Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// GET /wallet/balance
router.get("/balance", protect, async (req: Request, res: Response) => {
  res.json({ balance: 0 });
});

// GET /wallet/transactions
router.get("/transactions", protect, async (req: Request, res: Response) => {
  res.json({ transactions: [] });
});

// POST /wallet/escrow/hold
router.post("/escrow/hold", protect, async (req: Request, res: Response) => {
  res.json({ message: "Funds held" });
});

// POST /wallet/escrow/release
router.post("/escrow/release", protect, async (req: Request, res: Response) => {
  res.json({ message: "Funds released" });
});

export default router;
