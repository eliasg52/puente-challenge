import React from "react";
import { Stock } from "../services/market.service";
import FavoriteButton from "./FavoriteButton";
import { formatPrice, formatPercent } from "../utils/formatters";

interface StockListProps {
  stocks: Stock[];
  onToggleFavorite?: (stock: Stock) => void;
  isLoading?: boolean;
  disabledFavorites?: string[];
}

const StockList: React.FC<StockListProps> = ({
  stocks,
  onToggleFavorite,
  isLoading = false,
  disabledFavorites = [],
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="text-gray-500">Cargando acciones...</p>
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No hay acciones disponibles
      </div>
    );
  }

  return (
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
            {onToggleFavorite && (
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Favorito
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stocks.map((stock) => (
            <tr key={stock.id} data-testid="stock-row">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {stock.symbol}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{stock.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-gray-900">
                  {formatPrice(stock.price)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div
                  className={`text-sm ${
                    stock.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercent(stock.changePercent)}
                </div>
              </td>
              {onToggleFavorite && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <FavoriteButton
                    isFavorite={stock.isFavorite || false}
                    onClick={() => onToggleFavorite(stock)}
                    isDisabled={disabledFavorites.includes(stock.id)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockList;
