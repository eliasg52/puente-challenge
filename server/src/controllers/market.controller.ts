import { Request, Response } from "express";
import * as coinGeckoService from "../services/coingecko.service";
import { Stock } from "../models/Stock";

// Favoritos por usuario (simulados en memoria por ahora)
const userFavorites: Record<number, string[]> = {};

// Obtener todos los stocks (criptomonedas)
export const getAllStocks = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stocks = await coinGeckoService.getPopularCryptos();

    if (!stocks || stocks.length === 0) {
      res
        .status(404)
        .json({ message: "No se encontraron datos de criptomonedas" });
      return;
    }

    res.status(200).json({ stocks });
  } catch (error) {
    console.error("Error obteniendo criptomonedas:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Obtener un stock (criptomoneda) por su símbolo
export const getStockBySymbol = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({ message: "Símbolo no proporcionado" });
      return;
    }

    // Obtener datos de la API
    const stock = await coinGeckoService.getCryptoDetails(symbol);

    if (!stock) {
      res.status(404).json({ message: "Criptomoneda no encontrada" });
      return;
    }

    // Verificar si es favorito para el usuario actual
    const userId = (req as any).userId || 1;
    if (userFavorites[userId] && userFavorites[userId].includes(symbol)) {
      stock.isFavorite = true;
    }

    res.status(200).json({ stock });
  } catch (error) {
    console.error("Error obteniendo criptomoneda por símbolo:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Buscar stocks (criptomonedas) por término
export const searchStocks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query as { query: string };

    if (!query || query.trim().length < 2) {
      res.status(400).json({
        message: "Se requiere un término de búsqueda de al menos 2 caracteres",
      });
      return;
    }

    const stocks = await coinGeckoService.searchCryptos(query);

    // Marcar favoritos
    const userId = (req as any).userId || 1;
    if (userFavorites[userId]) {
      stocks.forEach((stock) => {
        if (userFavorites[userId].includes(stock.symbol)) {
          stock.isFavorite = true;
        }
      });
    }

    res.status(200).json({ stocks });
  } catch (error) {
    console.error("Error buscando criptomonedas:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Obtener favoritos del usuario
export const getFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId || 1;
    const favoriteSymbols = userFavorites[userId] || [];

    if (favoriteSymbols.length === 0) {
      res.status(200).json({ stocks: [] });
      return;
    }

    const favorites: Stock[] = [];

    // Obtener datos actualizados de cada favorito
    for (const symbol of favoriteSymbols) {
      const stock = await coinGeckoService.getCryptoDetails(symbol);
      if (stock) {
        stock.isFavorite = true;
        favorites.push(stock);
      }
    }

    res.status(200).json({ stocks: favorites });
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Añadir a favoritos
export const addToFavorites = (req: Request, res: Response): void => {
  try {
    const { stockId } = req.body;
    const userId = (req as any).userId || 1;

    if (!stockId) {
      res.status(400).json({ message: "Se requiere el ID de la criptomoneda" });
      return;
    }

    if (!userFavorites[userId]) {
      userFavorites[userId] = [];
    }

    if (!userFavorites[userId].includes(stockId)) {
      userFavorites[userId].push(stockId);
    }

    res.status(200).json({ message: "Criptomoneda añadida a favoritos" });
  } catch (error) {
    console.error("Error añadiendo a favoritos:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Remover de favoritos
export const removeFromFavorites = (req: Request, res: Response): void => {
  try {
    const { stockId } = req.params;
    const userId = (req as any).userId || 1;

    if (!userFavorites[userId]) {
      res.status(404).json({ message: "No se encontraron favoritos" });
      return;
    }

    userFavorites[userId] = userFavorites[userId].filter(
      (id) => id !== stockId
    );

    res.status(200).json({ message: "Criptomoneda eliminada de favoritos" });
  } catch (error) {
    console.error("Error eliminando de favoritos:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Limpiar caché
export const clearCache = (_req: Request, res: Response): void => {
  try {
    coinGeckoService.clearCache();
    res.status(200).json({ message: "Caché limpiada correctamente" });
  } catch (error) {
    console.error("Error limpiando caché:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
