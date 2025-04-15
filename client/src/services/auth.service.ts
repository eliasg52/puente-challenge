import apiClient from "./api-client";
import {
  AuthResponse,
  User,
  LoginCredentials,
  RegisterData,
} from "../types/auth";
import useAuthStore from "../store/authStore";

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials
  );
  // Guardar el token en localStorage
  localStorage.setItem("token", response.token);

  // Actualizar el estado global de autenticación
  if (response.user) {
    useAuthStore.setState({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }

  return response;
};

export const register = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    userData
  );
  // Guardar el token en localStorage
  localStorage.setItem("token", response.token);

  // Actualizar el estado global de autenticación
  if (response.user) {
    useAuthStore.setState({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }

  return response;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>("/auth/me");
  return response;
};

export const logout = (): void => {
  localStorage.removeItem("token");

  // Limpiar el estado de autenticación
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
};

// Admin services
export const getAllUsers = async (): Promise<{ users: User[] }> => {
  const response = await apiClient.get<{ users: User[] }>("/auth/users");
  return response;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await apiClient.delete(`/auth/users/${userId}`);
};
