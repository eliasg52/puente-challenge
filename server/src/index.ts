import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json";
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
app.get("/", (req, res) => {
  res.json({
    message: "API Puente Inversiones",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});
