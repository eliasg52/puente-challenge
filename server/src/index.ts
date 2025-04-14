import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
// import { join } from "path";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.routes";
import marketRoutes from "./routes/market.routes";

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Financial Markets API" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
