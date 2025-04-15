import { Request, Response } from "express";
import * as coinGeckoService from "../services/coingecko.service";
import { Stock } from "../models/Stock";
import fs from "fs";
import path from "path";

// Path to store favorites data
const FAVORITES_PATH = path.join(__dirname, "../../data");
const FAVORITES_FILE = path.join(FAVORITES_PATH, "favorites.json");

// Initialize favorites storage
let userFavorites: Record<number, string[]> = {};

// Load favorites from file
const loadFavorites = (): void => {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(FAVORITES_PATH)) {
      fs.mkdirSync(FAVORITES_PATH, { recursive: true });
    }

    // Create file if it doesn't exist
    if (!fs.existsSync(FAVORITES_FILE)) {
      fs.writeFileSync(FAVORITES_FILE, JSON.stringify({}));
      return;
    }

    const data = fs.readFileSync(FAVORITES_FILE, "utf8");
    userFavorites = JSON.parse(data);
    console.log("Favorites loaded from file.");
  } catch (error) {
    console.error("Error loading favorites:", error);
    userFavorites = {};
  }
};

// Save favorites to file
const saveFavorites = (): void => {
  try {
    if (!fs.existsSync(FAVORITES_PATH)) {
      fs.mkdirSync(FAVORITES_PATH, { recursive: true });
    }
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(userFavorites));
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
};

// Load favorites on startup
loadFavorites();

// Obtener todos los stocks (criptomonedas)
export const getAllStocks = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stocks = await coinGeckoService.getPopularCryptos();

    // Marcar favoritos para el usuario actual
    const userId = (_req as any).userId || 1;
    if (stocks && userFavorites[userId]) {
      stocks.forEach((stock) => {
        // Verificamos si el ID del stock está en la lista de favoritos
        if (userFavorites[userId].includes(stock.id)) {
          stock.isFavorite = true;
        }
      });
    }

    res.status(200).json({
      stocks: stocks || [],
      isFromMockData: stocks.length === 0, // Indicamos si son datos ficticios
    });
  } catch (error: any) {
    console.error("Error obteniendo criptomonedas:", error);

    // Verificar si es un error de límite de peticiones
    const isRateLimitError =
      error.status === 429 || (error.response && error.response.status === 429);

    // Generar datos ficticios para mostrar al cliente
    const mockStocks = generateMockStocks();

    // Marcar los favoritos en los datos ficticios
    const userId = (_req as any).userId || 1;
    if (userFavorites[userId]) {
      mockStocks.forEach((stock) => {
        if (userFavorites[userId].includes(stock.id)) {
          stock.isFavorite = true;
        }
      });
    }

    // Enviamos datos ficticios pero indicamos que lo son
    res.status(200).json({
      stocks: mockStocks,
      isFromMockData: true,
      rateLimitExceeded: isRateLimitError,
    });
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

    try {
      // Obtener datos de la API
      const stock = await coinGeckoService.getCryptoDetails(symbol);

      if (!stock) {
        // Si no encontramos el stock, buscamos en los datos ficticios
        const mockStock = findMockStockBySymbol(symbol);
        if (mockStock) {
          // Verificar si es favorito para el usuario actual
          const userId = (req as any).userId || 1;
          if (
            userFavorites[userId] &&
            userFavorites[userId].includes(mockStock.id)
          ) {
            mockStock.isFavorite = true;
          }

          res.status(200).json({
            stock: mockStock,
            isFromMockData: true,
          });
          return;
        }

        res.status(404).json({ message: "Criptomoneda no encontrada" });
        return;
      }

      // Verificar si es favorito para el usuario actual
      const userId = (req as any).userId || 1;
      if (userFavorites[userId] && userFavorites[userId].includes(stock.id)) {
        stock.isFavorite = true;
      }

      res.status(200).json({
        stock,
        isFromMockData: false,
      });
    } catch (error: any) {
      // Si hay un error de límite de peticiones, usamos datos ficticios
      const isRateLimitError =
        error.status === 429 ||
        (error.response && error.response.status === 429);

      if (isRateLimitError) {
        // Buscar en los datos ficticios
        const mockStock = findMockStockBySymbol(symbol);
        if (mockStock) {
          // Verificar si es favorito para el usuario actual
          const userId = (req as any).userId || 1;
          if (
            userFavorites[userId] &&
            userFavorites[userId].includes(mockStock.id)
          ) {
            mockStock.isFavorite = true;
          }

          res.status(200).json({
            stock: mockStock,
            isFromMockData: true,
            rateLimitExceeded: true,
          });
          return;
        }
      }

      // Si no es un error de límite o no pudimos encontrar datos ficticios
      throw error;
    }
  } catch (error) {
    console.error("Error obteniendo criptomoneda por símbolo:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Función para buscar una criptomoneda ficticia por símbolo
function findMockStockBySymbol(symbol: string): Stock | null {
  const mockStocks = generateMockStocks();
  // Normalizar el símbolo para la búsqueda (mayúsculas)
  const normalizedSymbol = symbol.toUpperCase();

  // Buscar por símbolo o por ID
  const stockBySymbol = mockStocks.find(
    (stock) =>
      stock.symbol.toUpperCase() === normalizedSymbol ||
      stock.id.toUpperCase() === normalizedSymbol
  );

  return stockBySymbol || null;
}

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

    try {
      const stocks = await coinGeckoService.searchCryptos(query);

      // Marcar favoritos
      const userId = (req as any).userId || 1;
      if (userFavorites[userId]) {
        stocks.forEach((stock) => {
          // Usar el ID del stock en lugar del símbolo
          if (userFavorites[userId].includes(stock.id)) {
            stock.isFavorite = true;
          }
        });
      }

      res.status(200).json({
        stocks,
        isFromMockData: false,
      });
    } catch (error: any) {
      // Si hay un error de límite de peticiones, usamos datos ficticios
      const isRateLimitError =
        error.status === 429 ||
        (error.response && error.response.status === 429);

      if (isRateLimitError) {
        // Buscar en los datos ficticios que coincidan con la búsqueda
        const mockResults = searchMockStocks(query);

        // Marcar favoritos en los resultados
        const userId = (req as any).userId || 1;
        if (userFavorites[userId]) {
          mockResults.forEach((stock) => {
            if (userFavorites[userId].includes(stock.id)) {
              stock.isFavorite = true;
            }
          });
        }

        res.status(200).json({
          stocks: mockResults,
          isFromMockData: true,
          rateLimitExceeded: true,
        });
        return;
      }

      // Si no es un error de límite, reenviar el error
      throw error;
    }
  } catch (error) {
    console.error("Error buscando criptomonedas:", error);

    // En caso de error, devolvemos resultados ficticios filtrados
    const { query } = req.query as { query: string };
    const mockResults = searchMockStocks(query);

    // Marcar favoritos
    const userId = (req as any).userId || 1;
    if (userFavorites[userId]) {
      mockResults.forEach((stock) => {
        if (userFavorites[userId].includes(stock.id)) {
          stock.isFavorite = true;
        }
      });
    }

    res.status(200).json({
      stocks: mockResults,
      isFromMockData: true,
    });
  }
};

// Función para buscar en los datos ficticios
function searchMockStocks(query: string): Stock[] {
  const mockStocks = generateMockStocks();
  const normalizedQuery = query.toLowerCase();

  return mockStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(normalizedQuery) ||
      stock.name.toLowerCase().includes(normalizedQuery) ||
      stock.id.toLowerCase().includes(normalizedQuery)
  );
}

// Obtener favoritos del usuario
export const getFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId || 1;
    const favoriteIds = userFavorites[userId] || [];

    if (favoriteIds.length === 0) {
      res.status(200).json({
        stocks: [],
        isFromMockData: false,
      });
      return;
    }

    const favorites: Stock[] = [];
    let hasError = false;
    let isRateLimitError = false;

    // Obtener datos actualizados de cada favorito
    for (const id of favoriteIds) {
      try {
        const stock = await coinGeckoService.getCryptoDetails(id);
        if (stock) {
          stock.isFavorite = true;
          favorites.push(stock);
        }
      } catch (error: any) {
        hasError = true;
        // Verificar si es un error de límite de peticiones
        if (
          error.status === 429 ||
          (error.response && error.response.status === 429)
        ) {
          isRateLimitError = true;
          break; // No intentar más peticiones si se ha excedido el límite
        }
      }
    }

    // Si tuvimos algún error al obtener datos pero tenemos algunos datos, devolvemos lo que tenemos
    if (hasError && favorites.length > 0) {
      res.status(200).json({
        stocks: favorites,
        isFromMockData: false,
        isPartialData: true,
        rateLimitExceeded: isRateLimitError,
      });
      return;
    }

    // Si tuvimos un error de límite de API o no pudimos obtener ningún dato real,
    // generamos datos ficticios a partir de los IDs favoritos
    if (hasError || favorites.length === 0) {
      const mockFavorites = generateMockForFavorites(favoriteIds);
      res.status(200).json({
        stocks: mockFavorites,
        isFromMockData: true,
        rateLimitExceeded: isRateLimitError,
      });
      return;
    }

    // Si llegamos aquí, todo ha ido bien
    res.status(200).json({
      stocks: favorites,
      isFromMockData: false,
    });
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    // Generar datos ficticios para los favoritos
    const userId = (req as any).userId || 1;
    const favoriteIds = userFavorites[userId] || [];
    const mockFavorites = generateMockForFavorites(favoriteIds);

    res.status(200).json({
      stocks: mockFavorites,
      isFromMockData: true,
    });
  }
};

// Función para generar datos ficticios para los favoritos
function generateMockForFavorites(favoriteIds: string[]): Stock[] {
  // Generamos datos ficticios completos
  const allMockStocks = generateMockStocks();

  // Filtramos los que son favoritos
  const mockFavorites = allMockStocks
    .filter((stock) => favoriteIds.includes(stock.id))
    .map((stock) => ({
      ...stock,
      isFavorite: true,
    }));

  // Si no encontramos coincidencias en nuestros datos ficticios predefinidos,
  // creamos datos ficticios genéricos para los IDs
  if (mockFavorites.length < favoriteIds.length) {
    const existingIds = mockFavorites.map((stock) => stock.id);
    const missingIds = favoriteIds.filter((id) => !existingIds.includes(id));

    missingIds.forEach((id) => {
      // Creamos un dato ficticio genérico
      mockFavorites.push({
        id,
        symbol: id.slice(0, 4).toUpperCase(),
        name: `${id.charAt(0).toUpperCase()}${id.slice(1).replace(/-/g, " ")}`,
        price: 100 + Math.random() * 900,
        change: Math.random() * 20 - 10,
        changePercent: Math.random() * 8 - 4,
        high: 0,
        low: 0,
        volume: 0,
        isFavorite: true,
      });
    });
  }

  return mockFavorites;
}

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
      // Persist the change
      saveFavorites();
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

    // Persist the change
    saveFavorites();

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

// Función para generar datos ficticios consistentes
function generateMockStocks(): Stock[] {
  const mockData: Stock[] = [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      price: 65432.1,
      change: 543.21,
      changePercent: 0.83,
      high: 66000.0,
      low: 64800.0,
      volume: 28761492837,
      isFavorite: false,
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      price: 3058.47,
      change: -21.35,
      changePercent: -0.69,
      high: 3120.18,
      low: 3040.22,
      volume: 12387654321,
      isFavorite: false,
    },
    {
      id: "ripple",
      symbol: "XRP",
      name: "XRP",
      price: 0.5723,
      change: -0.0081,
      changePercent: -1.39,
      high: 0.5804,
      low: 0.5642,
      volume: 1987654321,
      isFavorite: false,
    },
    {
      id: "cardano",
      symbol: "ADA",
      name: "Cardano",
      price: 0.4531,
      change: 0.0124,
      changePercent: 2.81,
      high: 0.4587,
      low: 0.4407,
      volume: 987654321,
      isFavorite: false,
    },
    {
      id: "solana",
      symbol: "SOL",
      name: "Solana",
      price: 129.83,
      change: 2.15,
      changePercent: 1.68,
      high: 131.5,
      low: 127.68,
      volume: 3456789012,
      isFavorite: false,
    },
    {
      id: "polkadot",
      symbol: "DOT",
      name: "Polkadot",
      price: 6.82,
      change: 0.15,
      changePercent: 2.25,
      high: 6.95,
      low: 6.67,
      volume: 567890123,
      isFavorite: false,
    },
    {
      id: "dogecoin",
      symbol: "DOGE",
      name: "Dogecoin",
      price: 0.1345,
      change: -0.0035,
      changePercent: -2.54,
      high: 0.138,
      low: 0.131,
      volume: 2345678901,
      isFavorite: false,
    },
    {
      id: "avalanche-2",
      symbol: "AVAX",
      name: "Avalanche",
      price: 28.64,
      change: 0.91,
      changePercent: 3.29,
      high: 29.12,
      low: 27.73,
      volume: 789012345,
      isFavorite: false,
    },
    {
      id: "chainlink",
      symbol: "LINK",
      name: "Chainlink",
      price: 14.27,
      change: 0.32,
      changePercent: 2.29,
      high: 14.59,
      low: 13.95,
      volume: 901234567,
      isFavorite: false,
    },
    {
      id: "uniswap",
      symbol: "UNI",
      name: "Uniswap",
      price: 8.93,
      change: -0.17,
      changePercent: -1.87,
      high: 9.1,
      low: 8.76,
      volume: 678901234,
      isFavorite: false,
    },
  ];

  return mockData;
}
