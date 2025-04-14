import { Router } from "express";
import {
  getAllStocks,
  getStockBySymbol,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  searchStocks,
  clearCache,
} from "../controllers/market.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Rutas públicas
router.get("/stocks", getAllStocks);
router.get("/stocks/search", searchStocks);
router.get("/stocks/:symbol", getStockBySymbol);

// Rutas protegidas (requieren autenticación)
router.get("/favorites", authenticateToken, getFavorites);
router.post("/favorites", authenticateToken, addToFavorites);
router.delete("/favorites/:stockId", authenticateToken, removeFromFavorites);
router.post("/cache/clear", authenticateToken, clearCache);

export default router;
