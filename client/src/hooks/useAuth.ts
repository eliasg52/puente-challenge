import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authService from "../services/auth.service";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth";
import useAuthStore from "../store/authStore";

export const useLogin = () => {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      // Actualizar el estado de autenticación en Zustand
      login(
        data.user
          ? {
              email: data.user.email,
              password: "", // No guardamos la contraseña real por seguridad
            }
          : { email: "", password: "" }
      );

      // Invalidar consultas que pueden depender del estado de autenticación
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
  });
};

export const useRegister = () => {
  const setState = useAuthStore((state) => state);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (data) => {
      // Actualizar el estado directamente sin usar register
      setState({
        user: data.user || null,
        isAuthenticated: !!data.user,
        isLoading: false,
        error: null,
      });

      // Invalidar consultas que pueden depender del estado de autenticación
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    // Llamar al servicio de logout
    authService.logout();

    // Actualizar el estado de autenticación en Zustand
    logout();

    // Limpiar caché de consultas que dependen del estado de autenticación
    queryClient.invalidateQueries({
      queryKey: ["currentUser"],
    });
  };
};

export const useCurrentUser = () => {
  const token = localStorage.getItem("token");

  return useQuery<AuthResponse>({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: !!token, // Solo realizar la consulta si hay un token
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    onError: () => {
      // Si hay un error (token inválido o expirado), limpiar el token
      authService.logout();
    },
  });
};

// Hook para comprobar si el usuario está autenticado
export const useIsAuthenticated = () => {
  const { data, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!data?.user,
    user: data?.user,
    isLoading,
  };
};
