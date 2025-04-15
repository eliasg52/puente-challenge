import axios from "axios";
import { Stock } from "../models/Stock";
import NodeCache from "node-cache";

// API URL base de CoinGecko
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

// Incrementamos el tiempo de caché a 30 minutos para reducir las peticiones a la API
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });

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

// Variable para controlar si estamos en estado de rate limit
let isRateLimited = false;
let rateLimitResetTime = 0;

// Función para comprobar si estamos en rate limit
const checkRateLimit = (): boolean => {
  if (!isRateLimited) return false;

  const now = Date.now();
  if (now > rateLimitResetTime) {
    // Si ha pasado el tiempo de rate limit, lo reseteamos
    isRateLimited = false;
    rateLimitResetTime = 0;
    return false;
  }

  return true;
};

// Función para establecer el rate limit
const setRateLimit = (retryAfterSeconds: number = 60): void => {
  isRateLimited = true;
  // Tiempo actual + los segundos que hay que esperar + 5 segundos extra de margen
  rateLimitResetTime = Date.now() + retryAfterSeconds * 1000 + 5000;
  console.log(
    `Rate limit establecido. Se reintentará después de ${retryAfterSeconds} segundos`
  );
};

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

  // Verificar si estamos en rate limit
  if (checkRateLimit()) {
    console.log(
      "[RATE LIMIT] Uso de API de CoinGecko limitado. Usando datos del último respaldo"
    );
    const backupData = cache.get<Stock[]>("backup_popular_cryptos");
    if (backupData) {
      return backupData;
    }
    return []; // Si no hay respaldo, devolver array vacío
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
      timeout: 5000, // Timeout de 5 segundos para evitar esperas largas
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

    // Guardar también en caché de respaldo para casos de rate limit
    cache.set("backup_popular_cryptos", stocks, 86400); // 24 horas de respaldo

    return stocks;
  } catch (error: any) {
    console.error("Error obteniendo criptomonedas populares:", error);

    // Comprobar si es un error de rate limit
    if (error.response && error.response.status === 429) {
      // Obtener el tiempo de espera del header Retry-After si existe
      const retryAfter = error.response.headers["retry-after"];
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;

      // Establecer el rate limit
      setRateLimit(waitSeconds);

      // Intentar usar datos del respaldo
      const backupData = cache.get<Stock[]>("backup_popular_cryptos");
      if (backupData) {
        return backupData;
      }
    }

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

  // Verificar si estamos en rate limit
  if (checkRateLimit()) {
    console.log(
      `[RATE LIMIT] Uso de API de CoinGecko limitado. Buscando ${symbol} en respaldo`
    );
    // Intentar encontrar en los datos populares de respaldo
    const backupPopular = cache.get<Stock[]>("backup_popular_cryptos");
    if (backupPopular) {
      const stockFromBackup = backupPopular.find(
        (s) =>
          s.symbol.toLowerCase() === symbolLower ||
          s.id.toLowerCase() === symbolLower
      );
      if (stockFromBackup) return stockFromBackup;
    }

    // Intentar encontrar en caché de respaldo específica
    const backupStock = cache.get<Stock>(`backup_crypto_${symbolLower}`);
    if (backupStock) return backupStock;

    return null;
  }

  try {
    console.log(`[API CALL] Obteniendo datos de ${symbol} de CoinGecko`);

    // Primero necesitamos obtener el ID de CoinGecko para este símbolo
    // Intentar primero con los datos populares en caché para evitar una petición
    const popularStocks = cache.get<Stock[]>("popular_cryptos");
    if (popularStocks) {
      const stockFromPopular = popularStocks.find(
        (s) =>
          s.symbol.toLowerCase() === symbolLower ||
          s.id.toLowerCase() === symbolLower
      );
      if (stockFromPopular) {
        // Guardar en caché específica
        cache.set(cacheKey, stockFromPopular);
        // También en respaldo
        cache.set(`backup_crypto_${symbolLower}`, stockFromPopular, 86400);
        return stockFromPopular;
      }
    }

    // Si no está en populares, hacer la petición a la API
    const coinsListUrl = `${COINGECKO_API_URL}/coins/list`;
    const coinsListResponse = await axios.get(coinsListUrl, { timeout: 5000 });
    const coinData = coinsListResponse.data.find(
      (coin: any) =>
        coin.symbol.toLowerCase() === symbolLower ||
        coin.id.toLowerCase() === symbolLower
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
      timeout: 5000,
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
    // También en caché de respaldo
    cache.set(`backup_crypto_${symbolLower}`, stock, 86400);

    return stock;
  } catch (error: any) {
    console.error(`Error obteniendo datos de ${symbol}:`, error);

    // Comprobar si es un error de rate limit
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;

      setRateLimit(waitSeconds);

      // Intentar buscar en backup
      const backupPopular = cache.get<Stock[]>("backup_popular_cryptos");
      if (backupPopular) {
        const stockFromBackup = backupPopular.find(
          (s) =>
            s.symbol.toLowerCase() === symbolLower ||
            s.id.toLowerCase() === symbolLower
        );
        if (stockFromBackup) return stockFromBackup;
      }

      // Intentar caché de respaldo específica
      const backupStock = cache.get<Stock>(`backup_crypto_${symbolLower}`);
      if (backupStock) return backupStock;
    }

    return null;
  }
};

/**
 * Busca criptomonedas por término
 */
export const searchCryptos = async (query: string): Promise<Stock[]> => {
  const cacheKey = `search_${query.toLowerCase()}`;

  // Verificar si los datos están en caché
  const cachedData = cache.get<Stock[]>(cacheKey);
  if (cachedData) {
    console.log(
      `[CACHE HIT] Obteniendo resultados de búsqueda para "${query}" de caché`
    );
    return cachedData;
  }

  // Verificar si estamos en rate limit
  if (checkRateLimit()) {
    console.log(
      `[RATE LIMIT] Uso de API de CoinGecko limitado. Buscando "${query}" en datos locales`
    );

    // Buscar en los datos populares de respaldo
    const backupPopular = cache.get<Stock[]>("backup_popular_cryptos");
    if (backupPopular) {
      const filteredResults = backupPopular.filter(
        (stock) =>
          stock.name.toLowerCase().includes(query.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.id.toLowerCase().includes(query.toLowerCase())
      );

      if (filteredResults.length > 0) {
        return filteredResults;
      }
    }

    // Si no hay coincidencias, intentar buscar en todos los backups individuales
    // Pero esto puede ser costoso, así que limitamos a búsquedas exactas
    if (query.length >= 3) {
      const exactMatchKey = `backup_crypto_${query.toLowerCase()}`;
      const exactMatch = cache.get<Stock>(exactMatchKey);
      if (exactMatch) {
        return [exactMatch];
      }
    }

    return []; // Si no hay resultados, devolver array vacío
  }

  try {
    console.log(
      `[API CALL] Buscando criptomonedas que coincidan con "${query}"`
    );

    // Primero intentar filtrar los datos populares en caché para evitar una petición
    const popularStocks = cache.get<Stock[]>("popular_cryptos");
    if (popularStocks) {
      const filteredResults = popularStocks.filter(
        (stock) =>
          stock.name.toLowerCase().includes(query.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.id.toLowerCase().includes(query.toLowerCase())
      );

      if (filteredResults.length > 0) {
        cache.set(cacheKey, filteredResults);
        return filteredResults;
      }
    }

    // Si no hay resultados en caché, hacer la petición a la API
    const searchUrl = `${COINGECKO_API_URL}/search`;
    const searchResponse = await axios.get(searchUrl, {
      params: {
        query: query,
      },
      timeout: 5000,
    });

    // Tomar los primeros 5 resultados de monedas para limitar peticiones
    const coinResults = searchResponse.data.coins.slice(0, 5);
    const stocks: Stock[] = [];

    for (const coin of coinResults) {
      try {
        // Primero verificar si ya tenemos estos datos en caché
        const stockCacheKey = `crypto_${coin.id.toLowerCase()}`;
        const cachedStock = cache.get<Stock>(stockCacheKey);

        if (cachedStock) {
          stocks.push(cachedStock);
          continue;
        }

        // Si no está en caché, obtener detalles de mercado
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
          timeout: 5000,
        });

        if (marketResponse.data.length > 0) {
          const coinData = marketResponse.data[0];
          const stock: Stock = {
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
          };

          // Guardar en caché individual
          cache.set(stockCacheKey, stock);
          // También en caché de respaldo
          cache.set(`backup_crypto_${coin.id.toLowerCase()}`, stock, 86400);

          stocks.push(stock);
        }
      } catch (err) {
        console.error(`Error obteniendo detalles para ${coin.id}:`, err);
      }
    }

    // Guardar en caché solo si hay datos
    if (stocks.length > 0) {
      cache.set(cacheKey, stocks);
    }

    return stocks;
  } catch (error: any) {
    console.error(`Error buscando criptomonedas para "${query}":`, error);

    // Comprobar si es un error de rate limit
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;

      setRateLimit(waitSeconds);

      // Intentar filtrar los datos de respaldo
      const backupPopular = cache.get<Stock[]>("backup_popular_cryptos");
      if (backupPopular) {
        const filteredResults = backupPopular.filter(
          (stock) =>
            stock.name.toLowerCase().includes(query.toLowerCase()) ||
            stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
            stock.id.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredResults.length > 0) {
          return filteredResults;
        }
      }
    }

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
