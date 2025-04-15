import { useState, useEffect } from "react";
import { useFavoriteStocks, useToggleFavorite } from "../hooks/useMarket";
import { Stock } from "../services/market.service";
import FavoriteButton from "../components/FavoriteButton";

const Favorites = () => {
  const {
    data,
    isLoading,
    error,
    refetch: refetchFavorites,
  } = useFavoriteStocks();
  const { toggleFavorite, isLoading: toggleLoading } = useToggleFavorite();
  // Estado local para manejar la lista de favoritos
  const [localFavorites, setLocalFavorites] = useState<Stock[]>([]);
  const [showMockDataAlert, setShowMockDataAlert] = useState(false);

  // Actualizar el estado local cuando llegan los datos
  useEffect(() => {
    if (data) {
      // Actualizar el estado de la alerta de datos ficticios
      setShowMockDataAlert(data.isFromMockData);

      const updatedFavorites = data.stocks.map((fav) => ({
        ...fav,
        isFavorite: true,
      }));
      setLocalFavorites(updatedFavorites);
    }
  }, [data]);

  // Forzar actualización al cargar el componente
  useEffect(() => {
    refetchFavorites();
  }, [refetchFavorites]);

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

  // Manejador para eliminar de favoritos
  const handleRemoveFromFavorites = (stock: Stock) => {
    // No modificamos el estado local directamente, pues useToggleFavorite
    // ya se encarga de actualizar el cache de React Query de forma optimista

    // Evitamos manipular la referencia original usando una copia
    toggleFavorite(JSON.parse(JSON.stringify(stock)));
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
        </div>
        <div className="bg-[#171924] rounded-lg shadow-md p-6 border border-gray-800">
          <div
            className="bg-red-900 border border-red-800 text-red-100 px-4 py-3 rounded"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline">
              {" "}
              No se pudieron cargar tus favoritos. Por favor, intente de nuevo
              más tarde.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!localFavorites || localFavorites.length === 0) {
    return (
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
        </div>
        <div className="bg-[#171924] rounded-lg shadow-md p-6 text-center border border-gray-800">
          <div className="mb-4 flex justify-center">
            <div className="transform scale-150">
              <FavoriteButton isFavorite={false} onClick={() => {}} />
            </div>
          </div>
          <h3 className="text-lg font-medium text-white">
            No tienes favoritos aún
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Marca tus acciones favoritas para seguir su desempeño desde aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
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
              {localFavorites.map((stock) => (
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
                      isFavorite={true}
                      onClick={() => handleRemoveFromFavorites(stock)}
                      isDisabled={toggleLoading}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
