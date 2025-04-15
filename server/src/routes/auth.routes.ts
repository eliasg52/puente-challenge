import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  deleteUser,
} from "../controllers/auth.controller";
import { authenticateToken, isAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);

// Admin routes
router.get("/users", authenticateToken, isAdmin, getAllUsers);
router.delete("/users/:id", authenticateToken, isAdmin, deleteUser);

export default router;
