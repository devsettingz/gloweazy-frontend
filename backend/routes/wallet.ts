import { Router, Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getBalance,
  topUp,
  getTransactions,
  holdEscrow,
  releaseEscrow,
  requestPayout,
} from "../controllers/walletController";

const router = Router();

// Wallet
router.get("/balance", protect, getBalance);
router.get("/transactions", protect, getTransactions);
router.post("/topup", protect, topUp);
router.post("/confirm", protect, (req: Request, res: Response) => {
  // Payment confirmation webhook simulation
  // In production, this verifies with payment provider
  res.json({ success: true, message: "Payment confirmed" });
});
router.post("/escrow/hold", protect, holdEscrow);
router.post("/escrow/release", protect, releaseEscrow);
router.post("/payout", protect, requestPayout);

export default router;
