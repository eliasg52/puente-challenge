import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel, { UserCreate, UserRole } from "../models/User";

// Generate JWT token
const generateToken = (
  userId: number,
  role: UserRole,
  email: string
): string => {
  const secret = process.env.JWT_SECRET || "your_jwt_secret_key_here";

  return jwt.sign({ id: userId, role, email }, secret, { expiresIn: "1d" });
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as UserCreate;

    // Validate input
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Please provide name, email and password" });
      return;
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    // Create user with specified role or default to USER
    const newUser = await UserModel.create({
      name,
      email,
      password,
      role: (role as UserRole) || UserRole.USER,
    });

    if (!newUser) {
      res.status(500).json({ message: "Error creating user" });
      return;
    }

    // Generate token
    const token = generateToken(newUser.id, newUser.role, newUser.email);

    // Return user info and token
    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" });
      return;
    }

    // Validate user credentials
    const user = await UserModel.validateUser(email, password);

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.role, user.email);

    // Return user info and token
    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user info
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // The user ID will be extracted from the JWT token in middleware
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (admin only)
export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await UserModel.getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user by ID (admin only)
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    // Don't allow self-deletion
    if (userId === (req as any).userId) {
      res.status(400).json({ message: "You cannot delete your own account" });
      return;
    }

    const success = await UserModel.deleteUser(userId);

    if (!success) {
      res.status(400).json({
        message: "User not found or cannot delete the last admin user",
      });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
