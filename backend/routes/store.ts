import { Router, Request, Response } from "express";

const router = Router();

// GET /store/products
router.get("/products", async (req: Request, res: Response) => {
  res.json({ products: [] });
});

export default router;
