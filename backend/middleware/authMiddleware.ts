import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: "client" | "stylist" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin only" });
    return;
  }
  next();
};
