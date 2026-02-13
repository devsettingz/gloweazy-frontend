import { Router, Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// GET /stylists/search
router.get("/search", async (req: Request, res: Response) => {
  res.json({ stylists: [] });
});

// GET /stylists/:id
router.get("/:id", async (req: Request, res: Response) => {
  res.json({ stylist: {} });
});

// POST /stylist/services
router.post("/services", protect, async (req: Request, res: Response) => {
  res.json({ message: "Service created" });
});

// GET /stylist/services
router.get("/services", protect, async (req: Request, res: Response) => {
  res.json({ services: [] });
});

export default router;
