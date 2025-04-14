import { create } from "zustand";
import { User, LoginCredentials, RegisterData } from "../types/auth";
import * as authService from "../services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      let errorMessage = "Error al registrarse";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    if (!localStorage.getItem("token")) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authService.getCurrentUser();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Si hay un error al obtener el usuario actual, probablemente el token
      // haya expirado o sea inválido, así que eliminamos la autenticación
      authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
