import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

// Extend Request type to include user information
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userEmail?: string;
      userRole?: string;
    }
  }
}

// Middleware to authenticate JWT token
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as jwt.JwtPayload;

    // Añadir la información del usuario decodificada a la solicitud
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido o expirado" });
    return;
  }
};

// Middleware to check if user is an admin
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.userRole !== UserRole.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
};
