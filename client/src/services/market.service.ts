import apiClient from "./api-client";

// Modelo de datos para la respuesta de Alpha Vantage
export interface StockQuote {
  symbol: string;
  open: string;
  high: string;
  low: string;
  price: string;
  volume: string;
  latestTradingDay: string;
  previousClose: string;
  change: string;
  changePercent: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  isFavorite?: boolean;
}

// Función para transformar la respuesta de la API
const transformQuoteToStock = (
  symbol: string,
  name: string,
  quoteData: any
): Stock => {
  return {
    id: symbol,
    symbol,
    name,
    price: parseFloat(quoteData["05. price"] || quoteData.price || "0"),
    change: parseFloat(quoteData["09. change"] || quoteData.change || "0"),
    changePercent: parseFloat(
      (
        quoteData["10. change percent"] ||
        quoteData.changePercent ||
        "0%"
      ).replace("%", "")
    ),
    high: parseFloat(quoteData["03. high"] || quoteData.high || "0"),
    low: parseFloat(quoteData["04. low"] || quoteData.low || "0"),
    volume: parseInt(quoteData["06. volume"] || quoteData.volume || "0", 10),
  };
};

// Obtener un listado de stocks (simulado para el desafío)
export const getStocks = async (): Promise<Stock[]> => {
  // Lista predefinida de símbolos para el desafío
  const defaultStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "WMT", name: "Walmart Inc." },
  ];

  try {
    // En un entorno real, esto vendría de una API externa
    // Para el desafío, obtenemos datos de nuestro backend que hace de proxy
    const response = await apiClient.get<{ stocks: Stock[] }>("/market/stocks");
    return response.stocks;
  } catch (error) {
    console.error("Error obteniendo lista de stocks:", error);

    // En caso de error, generamos datos ficticios para la demo
    return defaultStocks.map((stock) => ({
      id: stock.symbol,
      symbol: stock.symbol,
      name: stock.name,
      price: Math.random() * 1000,
      change: Math.random() * 100 - 50,
      changePercent: Math.random() * 10 - 5,
      high: Math.random() * 1200,
      low: Math.random() * 800,
      volume: Math.floor(Math.random() * 10000000),
    }));
  }
};

// Obtener detalles de un stock específico
export const getStockDetail = async (symbol: string): Promise<Stock> => {
  try {
    // En un entorno real, esto vendría de una API externa
    const response = await apiClient.get<{ stock: Stock }>(
      `/market/stocks/${symbol}`
    );
    return response.stock;
  } catch (error) {
    console.error(`Error obteniendo detalles del stock ${symbol}:`, error);

    // En caso de error, generamos datos ficticios para la demo
    return {
      id: symbol,
      symbol,
      name: symbol,
      price: Math.random() * 1000,
      change: Math.random() * 100 - 50,
      changePercent: Math.random() * 10 - 5,
      high: Math.random() * 1200,
      low: Math.random() * 800,
      volume: Math.floor(Math.random() * 10000000),
    };
  }
};

// Obtener los stocks favoritos del usuario
export const getFavoriteStocks = async (): Promise<Stock[]> => {
  try {
    const response = await apiClient.get<{ stocks: Stock[] }>(
      "/market/favorites"
    );
    return response.stocks;
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return [];
  }
};

// Añadir un stock a favoritos
export const addToFavorites = async (stockId: string): Promise<void> => {
  await apiClient.post<void>("/market/favorites", { stockId });
};

// Eliminar un stock de favoritos
export const removeFromFavorites = async (stockId: string): Promise<void> => {
  await apiClient.delete<void>(`/market/favorites/${stockId}`);
};
