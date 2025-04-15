import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as marketService from "../services/market.service";
import { Stock } from "../services/market.service";
import { useEffect } from "react";

// Hook para obtener la lista de acciones
export const useStocks = () => {
  const queryClient = useQueryClient();

  // Forzar la recarga al montar el componente
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["stocks"] });
  }, [queryClient]);

  return useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      const response = await marketService.getStocks();
      return {
        stocks: response.stocks,
        isFromMockData: response.isFromMockData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de caché (requisito del desafío)
    refetchOnMount: true, // Recargar al montar
    refetchOnWindowFocus: true, // Recargar al enfocar la ventana
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
  const queryClient = useQueryClient();

  // Forzar la recarga al montar el componente
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["favoriteStocks"] });
  }, [queryClient]);

  return useQuery({
    queryKey: ["favoriteStocks"],
    queryFn: async () => {
      const response = await marketService.getFavoriteStocks();
      return {
        stocks: response.stocks,
        isFromMockData: response.isFromMockData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de caché (requisito del desafío)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// Hook para añadir una acción a favoritos
export const useAddToFavorites = () => {
  return useMutation({
    mutationFn: (stockId: string) => marketService.addToFavorites(stockId),
    // No invalidamos queries para evitar recargas completas
    // Las actualizaciones se hacen mediante optimistic updates en useToggleFavorite
  });
};

// Hook para eliminar una acción de favoritos
export const useRemoveFromFavorites = () => {
  return useMutation({
    mutationFn: (stockId: string) => marketService.removeFromFavorites(stockId),
    // No invalidamos queries para evitar recargas completas
    // Las actualizaciones se hacen mediante optimistic updates en useToggleFavorite
  });
};

// Hook optimizado para actualizar un stock como favorito/no favorito
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const addMutation = useAddToFavorites();
  const removeMutation = useRemoveFromFavorites();

  const toggleFavorite = async (stock: Stock) => {
    // Hacer una copia profunda del objeto para no modificar la referencia original
    const originalStock = JSON.parse(JSON.stringify(stock));

    try {
      // Actualizar inmediatamente en la UI para evitar retraso visual
      // Aplicar optimistic update solo en la propiedad isFavorite
      queryClient.setQueryData(
        ["stocks"],
        (oldData: { stocks: Stock[]; isFromMockData: boolean } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            stocks: oldData.stocks.map((s) =>
              s.id === originalStock.id
                ? { ...s, isFavorite: !s.isFavorite }
                : s
            ),
          };
        }
      );

      // Actualizar optimísticamente la lista de favoritos
      if (originalStock.isFavorite) {
        // Si era favorito, lo quitamos de la lista
        queryClient.setQueryData(
          ["favoriteStocks"],
          (
            oldData: { stocks: Stock[]; isFromMockData: boolean } | undefined
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              stocks: oldData.stocks.filter((s) => s.id !== originalStock.id),
            };
          }
        );
      } else {
        // Si no era favorito, lo añadimos a la lista
        queryClient.setQueryData(
          ["favoriteStocks"],
          (
            oldData: { stocks: Stock[]; isFromMockData: boolean } | undefined
          ) => {
            if (!oldData)
              return {
                stocks: [{ ...originalStock, isFavorite: true }],
                isFromMockData: false,
              };

            if (!oldData.stocks || oldData.stocks.length === 0) {
              return {
                ...oldData,
                stocks: [{ ...originalStock, isFavorite: true }],
              };
            }

            if (!oldData.stocks.some((s) => s.id === originalStock.id)) {
              return {
                ...oldData,
                stocks: [
                  ...oldData.stocks,
                  { ...originalStock, isFavorite: true },
                ],
              };
            }

            return oldData;
          }
        );
      }

      // Realizar la petición al servidor en segundo plano
      if (originalStock.isFavorite) {
        await removeMutation.mutateAsync(originalStock.id);
      } else {
        await addMutation.mutateAsync(originalStock.id);
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);

      // Revertir los cambios optimistas en caso de error
      queryClient.setQueryData(
        ["stocks"],
        (oldData: { stocks: Stock[]; isFromMockData: boolean } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            stocks: oldData.stocks.map((s) =>
              s.id === originalStock.id
                ? { ...s, isFavorite: originalStock.isFavorite }
                : s
            ),
          };
        }
      );

      // También revertimos en la lista de favoritos
      queryClient.invalidateQueries({ queryKey: ["favoriteStocks"] });
    }
  };

  return {
    toggleFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
};
