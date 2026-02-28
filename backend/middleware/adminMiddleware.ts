import { Request, Response, NextFunction } from "express";

// Admin protection middleware
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  next();
};

// Super admin protection (for critical operations)
export const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  // Check for super admin email or specific flag
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  
  if (req.user.role !== "admin" || !superAdminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: "Access denied. Super admin only." });
  }

  next();
};
