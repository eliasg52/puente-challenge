import { useFavoriteStocks, useToggleFavorite } from "../hooks/useMarket";
import { Stock } from "../services/market.service";

const Favorites = () => {
  const { data: favorites, isLoading, error } = useFavoriteStocks();
  const { toggleFavorite, isLoading: toggleLoading } = useToggleFavorite();

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
    toggleFavorite(stock);
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis Favoritos</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Favoritos</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
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

  if (!favorites || favorites.length === 0) {
    return (
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis Favoritos</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No tienes favoritos aún
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Marca tus acciones favoritas para seguir su desempeño desde aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Favoritos</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Símbolo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Precio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cambio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  % Cambio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {favorites.map((stock) => (
                <tr key={stock.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatPrice(stock.price)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      stock.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stock.change > 0 ? "+" : ""}
                    {stock.change.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      stock.changePercent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPercent(stock.changePercent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      className={`p-1 rounded-full focus:outline-none ${
                        toggleLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => handleRemoveFromFavorites(stock)}
                      disabled={toggleLoading}
                      aria-label="Eliminar de favoritos"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
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
