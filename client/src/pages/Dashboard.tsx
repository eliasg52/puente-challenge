import { useEffect, useState } from "react";
import { useStocks } from "../hooks/useMarket";
import useAuthStore from "../store/authStore";
import { Stock } from "../services/market.service";
import { Link } from "react-router-dom";

// Componente para el dashboard
const Dashboard = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useStocks();
  const [greeting, setGreeting] = useState("");
  const [topPerformers, setTopPerformers] = useState<Stock[]>([]);
  const [worstPerformers, setWorstPerformers] = useState<Stock[]>([]);
  const [showMockDataAlert, setShowMockDataAlert] = useState(false);

  useEffect(() => {
    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) return "Buenos días";
      if (currentHour < 18) return "Buenas tardes";
      return "Buenas noches";
    };

    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    if (data?.stocks && data.stocks.length > 0) {
      // Actualizar el estado de la alerta de datos ficticios
      setShowMockDataAlert(data.isFromMockData);

      // Ordenar todas las acciones por rendimiento (% change) descendente
      // Independientemente de si son positivas o negativas
      const sortedStocks = [...data.stocks].sort(
        (a, b) => b.changePercent - a.changePercent
      );

      // Obtener las 3 con mejor rendimiento (pueden ser negativas)
      setTopPerformers(sortedStocks.slice(0, 3));

      // Obtener las 3 con peor rendimiento
      setWorstPerformers(sortedStocks.slice(-3).reverse());
    } else {
      // Si no hay datos, reiniciar los arrays
      setTopPerformers([]);
      setWorstPerformers([]);
    }
  }, [data]);

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

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="mt-6 bg-[#171924] rounded-lg shadow-md p-6 border border-gray-800">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            {greeting}, {user?.name}
          </h2>
          <p className="text-gray-400 mt-1">
            Bienvenido al panel de Puente Inversiones
          </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-[#171924] rounded-lg shadow-md p-4 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Acciones en alza
            </h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-2">Cargando acciones...</p>
              </div>
            ) : topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((stock) => (
                  <div
                    key={stock.id}
                    className="flex justify-between items-center p-3 bg-[#222531] rounded-md"
                  >
                    <div>
                      <p className="font-bold text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {formatPrice(stock.price)}
                      </p>
                      <p
                        className={`text-sm ${
                          stock.changePercent >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {formatPercent(stock.changePercent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                No hay acciones disponibles
              </p>
            )}
            <div className="mt-4">
              <Link
                to="/market"
                className="inline-flex items-center text-[#3861fb] hover:text-blue-400 transition-colors"
              >
                Ver mercado completo
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-[#171924] rounded-lg shadow-md p-4 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Acciones en baja
            </h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-2">Cargando acciones...</p>
              </div>
            ) : worstPerformers.length > 0 ? (
              <div className="space-y-4">
                {worstPerformers.map((stock) => (
                  <div
                    key={stock.id}
                    className="flex justify-between items-center p-3 bg-[#222531] rounded-md"
                  >
                    <div>
                      <p className="font-bold text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {formatPrice(stock.price)}
                      </p>
                      <p
                        className={`text-sm ${
                          stock.changePercent >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {formatPercent(stock.changePercent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                No hay acciones disponibles
              </p>
            )}
            <div className="mt-4">
              <Link
                to="/favorites"
                className="inline-flex items-center text-[#3861fb] hover:text-blue-400 transition-colors"
              >
                Ver favoritos
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#171924] p-6 rounded-lg shadow-lg mb-8 mt-8">
          <h2 className="text-xl font-bold mb-4 text-white">
            Bienvenido a Puente Inversiones
          </h2>
          <p className="text-gray-300 mb-4">
            Puente Inversiones le ofrece herramientas para seguir y analizar el
            mercado. Puede agregar acciones a favoritos para un acceso rápido.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <Link
              to="/market"
              className="bg-[#3861fb] hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors flex-1 text-center"
            >
              Explorar el Mercado
            </Link>
            <Link
              to="/favorites"
              className="bg-[#2c2f38] hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors flex-1 text-center"
            >
              Ver mis Favoritos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
