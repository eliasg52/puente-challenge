import { useState, useEffect } from "react";
import {
  useStocks,
  useToggleFavorite,
  useFavoriteStocks,
} from "../hooks/useMarket";
import { Stock } from "../services/market.service";
import FavoriteButton from "../components/FavoriteButton";
import { usePeriodicRefresh } from "../hooks/usePeriodicRefresh";

const Market = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, error, refetch: refetchStocks } = useStocks();
  const { data: favoritesData } = useFavoriteStocks();
  const { toggleFavorite, isLoading: toggleLoading } = useToggleFavorite();
  // Estado local para mantener actualizados los favoritos
  const [localStocks, setLocalStocks] = useState<Stock[]>([]);
  const [showMockDataAlert, setShowMockDataAlert] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Configurar la actualización periódica cada 5 minutos
  usePeriodicRefresh(() => {
    console.log(
      `[${new Date().toISOString()}] Actualizando datos de mercado periódicamente...`
    );
    refetchStocks();
    setLastUpdated(new Date());
  }, 5 * 60 * 1000);

  // Actualizar el estado local cuando llegan los datos y sincronizar con favoritos
  useEffect(() => {
    if (data?.stocks) {
      // Actualizar el estado de la alerta de datos ficticios
      setShowMockDataAlert(data.isFromMockData);

      // Sincronizar los favoritos con el estado local
      if (favoritesData?.stocks && favoritesData.stocks.length > 0) {
        const updatedStocks = data.stocks.map((stock) => {
          // Si el stock está en favoritos, marcarlo como favorito
          const isFavorite = favoritesData.stocks.some(
            (fav) => fav.id === stock.id
          );
          return { ...stock, isFavorite };
        });
        setLocalStocks(updatedStocks);
      } else {
        setLocalStocks(data.stocks);
      }
    }
  }, [data, favoritesData]);

  // Forzar actualización al cargar el componente
  useEffect(() => {
    refetchStocks();
  }, [refetchStocks]);

  // Filtrar stocks por nombre o símbolo
  const filteredStocks = localStocks?.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formato para números de precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Formato para porcentajes
  const formatPercent = (percent: number) => {
    return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
  };

  // Manejador para marcar/desmarcar favoritos
  const handleToggleFavorite = (stock: Stock) => {
    // No modificamos el estado local directamente, pues useToggleFavorite
    // ya se encarga de actualizar el cache de React Query de forma optimista

    // Evitamos manipular la referencia original usando una copia
    toggleFavorite(JSON.parse(JSON.stringify(stock)));
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Mercado</h1>
        </div>
        <div className="bg-[#171924] rounded-lg shadow-md p-6 border border-gray-800">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#222531] rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-[#222531] rounded"></div>
              <div className="h-4 bg-[#222531] rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Mercado</h1>
        </div>
        <div className="bg-[#171924] rounded-lg shadow-md p-6 border border-gray-800">
          <div
            className="bg-red-900 border border-red-800 text-red-100 px-4 py-3 rounded"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline">
              {" "}
              No se pudieron cargar los datos del mercado. Por favor, intente de
              nuevo más tarde.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Mercado</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por símbolo o nombre..."
              className="bg-[#222531] text-gray-300 px-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {showMockDataAlert && (
        <div
          className="mb-4 bg-amber-800 border border-amber-700 text-amber-100 px-4 py-3 rounded shadow-sm"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <span className="font-medium">Aviso:</span>
              <span className="ml-1">
                Se están mostrando datos ficticios porque se ha alcanzado el
                límite de la API. Los valores no representan datos reales del
                mercado.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#171924] rounded-lg shadow-md overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#171924]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Símbolo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Precio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Cambio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  % Cambio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#171924] divide-y divide-gray-800">
              {filteredStocks && filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-[#222531]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {stock.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">
                      {formatPrice(stock.price)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                        stock.change >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stock.change > 0 ? "+" : ""}
                      {stock.change.toFixed(2)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                        stock.changePercent >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatPercent(stock.changePercent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <FavoriteButton
                        isFavorite={!!stock.isFavorite}
                        onClick={() => handleToggleFavorite(stock)}
                        isDisabled={toggleLoading}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-400"
                  >
                    {searchTerm
                      ? "No se encontraron resultados para su búsqueda"
                      : "No hay acciones disponibles en este momento"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Market;
