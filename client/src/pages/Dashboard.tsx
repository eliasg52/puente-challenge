import { useEffect, useState } from "react";
import { useStocks } from "../hooks/useMarket";
import useAuthStore from "../store/authStore";
import { Stock } from "../services/market.service";

// Componente provisional para el dashboard
const Dashboard = () => {
  const { user } = useAuthStore();
  const { data: stocks } = useStocks();
  const [greeting, setGreeting] = useState("");
  const [topPerformers, setTopPerformers] = useState<Stock[]>([]);
  const [worstPerformers, setWorstPerformers] = useState<Stock[]>([]);

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
    if (stocks) {
      // Ordenar stocks por rendimiento (% change)
      const sortedStocks = [...stocks].sort(
        (a, b) => b.changePercent - a.changePercent
      );

      // Obtener los 3 mejores
      setTopPerformers(sortedStocks.slice(0, 3));

      // Obtener los 3 peores
      setWorstPerformers(sortedStocks.slice(-3).reverse());
    }
  }, [stocks]);

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
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {greeting}, {user?.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Bienvenido a tu panel de seguimiento de mercados financieros
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-600 mb-3">
              Resumen del mercado
            </h3>

            <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="px-4 py-2">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Mejores activos
                    </dt>
                    <dd className="mt-1">
                      <ul className="divide-y divide-gray-200">
                        {topPerformers.map((stock) => (
                          <li key={stock.symbol} className="py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <p className="text-sm font-medium text-gray-900">
                                  {stock.symbol}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {stock.name}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatPrice(stock.price)}
                                </span>
                                <span className="text-sm text-green-600">
                                  {formatPercent(stock.changePercent)}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>

                  <div className="px-4 py-2">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Peores activos
                    </dt>
                    <dd className="mt-1">
                      <ul className="divide-y divide-gray-200">
                        {worstPerformers.map((stock) => (
                          <li key={stock.symbol} className="py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <p className="text-sm font-medium text-gray-900">
                                  {stock.symbol}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {stock.name}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatPrice(stock.price)}
                                </span>
                                <span className="text-sm text-red-600">
                                  {formatPercent(stock.changePercent)}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-green-600 mb-3">Inicio rápido</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">
                  Explorar el mercado
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Consulta el estado actual de los instrumentos financieros.
                </p>
                <div className="mt-3">
                  <a
                    href="/market"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver mercado
                  </a>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">
                  Administrar favoritos
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Consulta y gestiona tus instrumentos favoritos.
                </p>
                <div className="mt-3">
                  <a
                    href="/favorites"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver favoritos
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
