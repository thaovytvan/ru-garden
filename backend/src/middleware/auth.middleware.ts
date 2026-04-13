import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  admin?: { id: string; username: string };
  user?: { id: string; email: string; role: string };
}

export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Không có quyền truy cập." });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // Allow admin model login (no role field) or user with ADMIN/STAFF role
    if (decoded.role === "USER") {
      res.status(403).json({ error: "Không đủ quyền truy cập tính năng Admin." });
      return;
    }
    req.admin = { id: decoded.id, username: decoded.username };
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role || "ADMIN" };
    next();
  } catch {
    res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

export const authenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Yêu cầu đăng nhập." });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role || "USER" };
    next();
  } catch {
    res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * Must be used AFTER authenticateAdmin or authenticateUser.
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: "Bạn không có quyền thực hiện hành động này." });
      return;
    }
    next();
  };
};

export const optionalAuthenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role || "USER" };
    next();
  } catch {
    // If token is invalid, we just proceed as guest
    next();
  }
};
