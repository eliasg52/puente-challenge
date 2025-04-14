import axios from "axios";
import { Stock } from "../models/Stock";
import NodeCache from "node-cache";

// API URL base de CoinGecko
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

// Caché en memoria con tiempo de expiración (15 minutos)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

// Lista de IDs de criptomonedas populares
const POPULAR_CRYPTOS = [
  "bitcoin",
  "ethereum",
  "ripple",
  "cardano",
  "solana",
  "polkadot",
  "dogecoin",
  "avalanche-2",
  "chainlink",
  "uniswap",
];

/**
 * Obtiene la lista de criptomonedas populares con datos actualizados
 */
export const getPopularCryptos = async (): Promise<Stock[]> => {
  const cacheKey = "popular_cryptos";

  // Verificar si los datos están en caché
  const cachedData = cache.get<Stock[]>(cacheKey);
  if (cachedData) {
    console.log("[CACHE HIT] Obteniendo criptomonedas populares de caché");
    return cachedData;
  }

  try {
    console.log("[API CALL] Obteniendo criptomonedas populares de CoinGecko");

    // Construir URL con parámetros para CoinGecko
    const url = `${COINGECKO_API_URL}/coins/markets`;
    const response = await axios.get(url, {
      params: {
        vs_currency: "usd",
        ids: POPULAR_CRYPTOS.join(","),
        order: "market_cap_desc",
        per_page: 10,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
    });

    // Transformar la respuesta al formato Stock
    const stocks: Stock[] = response.data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_24h || 0,
      changePercent: coin.price_change_percentage_24h || 0,
      high: coin.high_24h || 0,
      low: coin.low_24h || 0,
      volume: coin.total_volume || 0,
      isFavorite: false,
    }));

    // Guardar en caché
    cache.set(cacheKey, stocks);

    return stocks;
  } catch (error) {
    console.error("Error obteniendo criptomonedas populares:", error);
    return [];
  }
};

/**
 * Obtiene detalles de una criptomoneda específica
 */
export const getCryptoDetails = async (
  symbol: string
): Promise<Stock | null> => {
  const symbolLower = symbol.toLowerCase();
  const cacheKey = `crypto_${symbolLower}`;

  // Verificar si los datos están en caché
  const cachedData = cache.get<Stock>(cacheKey);
  if (cachedData) {
    console.log(`[CACHE HIT] Obteniendo datos de ${symbol} de caché`);
    return cachedData;
  }

  try {
    console.log(`[API CALL] Obteniendo datos de ${symbol} de CoinGecko`);

    // Primero necesitamos obtener el ID de CoinGecko para este símbolo
    const coinsListUrl = `${COINGECKO_API_URL}/coins/list`;
    const coinsListResponse = await axios.get(coinsListUrl);
    const coinData = coinsListResponse.data.find(
      (coin: any) => coin.symbol.toLowerCase() === symbolLower
    );

    if (!coinData) {
      console.log(`No se encontró el símbolo ${symbol} en CoinGecko`);
      return null;
    }

    // Ahora obtenemos los detalles completos
    const coinId = coinData.id;
    const detailsUrl = `${COINGECKO_API_URL}/coins/${coinId}`;
    const detailsResponse = await axios.get(detailsUrl, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      },
    });

    const data = detailsResponse.data;
    const marketData = data.market_data;

    const stock: Stock = {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      price: marketData.current_price.usd || 0,
      change: marketData.price_change_24h || 0,
      changePercent: marketData.price_change_percentage_24h || 0,
      high: marketData.high_24h.usd || 0,
      low: marketData.low_24h.usd || 0,
      volume: marketData.total_volume.usd || 0,
      isFavorite: false,
    };

    // Guardar en caché
    cache.set(cacheKey, stock);

    return stock;
  } catch (error) {
    console.error(`Error obteniendo datos de ${symbol}:`, error);
    return null;
  }
};

/**
 * Busca criptomonedas por término
 */
export const searchCryptos = async (query: string): Promise<Stock[]> => {
  const cacheKey = `search_${query}`;

  // Verificar si los datos están en caché
  const cachedData = cache.get<Stock[]>(cacheKey);
  if (cachedData) {
    console.log(
      `[CACHE HIT] Obteniendo resultados de búsqueda para "${query}" de caché`
    );
    return cachedData;
  }

  try {
    console.log(
      `[API CALL] Buscando criptomonedas que coincidan con "${query}"`
    );

    // Usar el endpoint de búsqueda de CoinGecko
    const searchUrl = `${COINGECKO_API_URL}/search`;
    const searchResponse = await axios.get(searchUrl, {
      params: {
        query: query,
      },
    });

    // Tomar los primeros 10 resultados de monedas
    const coinResults = searchResponse.data.coins.slice(0, 10);

    // Para cada resultado, obtener datos adicionales
    const stocks: Stock[] = [];

    // Solo tomamos los primeros 5 para no exceder límites
    const topResults = coinResults.slice(0, 5);

    for (const coin of topResults) {
      try {
        // Obtener detalles de mercado para cada moneda
        const marketsUrl = `${COINGECKO_API_URL}/coins/markets`;
        const marketResponse = await axios.get(marketsUrl, {
          params: {
            vs_currency: "usd",
            ids: coin.id,
            order: "market_cap_desc",
            per_page: 1,
            page: 1,
            sparkline: false,
            price_change_percentage: "24h",
          },
        });

        if (marketResponse.data.length > 0) {
          const coinData = marketResponse.data[0];
          stocks.push({
            id: coinData.id,
            symbol: coinData.symbol.toUpperCase(),
            name: coinData.name,
            price: coinData.current_price,
            change: coinData.price_change_24h || 0,
            changePercent: coinData.price_change_percentage_24h || 0,
            high: coinData.high_24h || 0,
            low: coinData.low_24h || 0,
            volume: coinData.total_volume || 0,
            isFavorite: false,
          });
        }
      } catch (err) {
        console.error(`Error obteniendo detalles para ${coin.id}:`, err);
      }
    }

    // Guardar en caché
    cache.set(cacheKey, stocks);

    return stocks;
  } catch (error) {
    console.error(`Error buscando criptomonedas para "${query}":`, error);
    return [];
  }
};

/**
 * Limpia la caché
 */
export const clearCache = (): void => {
  cache.flushAll();
  console.log("Caché limpiada");
};
