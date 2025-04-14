import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as marketService from "../services/market.service";
import { Stock } from "../services/market.service";

// Hook para obtener la lista de acciones
export const useStocks = () => {
  return useQuery({
    queryKey: ["stocks"],
    queryFn: marketService.getStocks,
    staleTime: 5 * 60 * 1000, // 5 minutos de caché (requisito del desafío)
  });
};

// Hook para obtener los detalles de una acción
export const useStockDetail = (symbol: string) => {
  return useQuery({
    queryKey: ["stock", symbol],
    queryFn: () => marketService.getStockDetail(symbol),
    staleTime: 5 * 60 * 1000, // 5 minutos de caché (requisito del desafío)
    enabled: !!symbol,
  });
};

// Hook para obtener las acciones favoritas
export const useFavoriteStocks = () => {
  return useQuery({
    queryKey: ["favoriteStocks"],
    queryFn: marketService.getFavoriteStocks,
    staleTime: 5 * 60 * 1000, // 5 minutos de caché (requisito del desafío)
  });
};

// Hook para añadir una acción a favoritos
export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stockId: string) => marketService.addToFavorites(stockId),
    onSuccess: () => {
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ["favoriteStocks"],
      });

      // Actualizar stocks para mostrar el nuevo favorito
      queryClient.invalidateQueries({
        queryKey: ["stocks"],
      });
    },
  });
};

// Hook para eliminar una acción de favoritos
export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stockId: string) => marketService.removeFromFavorites(stockId),
    onSuccess: () => {
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ["favoriteStocks"],
      });

      // Actualizar stocks para mostrar el cambio
      queryClient.invalidateQueries({
        queryKey: ["stocks"],
      });
    },
  });
};

// Hook optimizado para actualizar un stock como favorito/no favorito
export const useToggleFavorite = () => {
  const addMutation = useAddToFavorites();
  const removeMutation = useRemoveFromFavorites();

  const toggleFavorite = (stock: Stock) => {
    if (stock.isFavorite) {
      removeMutation.mutate(stock.id);
    } else {
      addMutation.mutate(stock.id);
    }
  };

  return {
    toggleFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
};
