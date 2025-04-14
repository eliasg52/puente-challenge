// Definir la URL base de la API
const API_BASE_URL = "http://localhost:3000/api";

// Tipos para las opciones de la petición
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

// Cliente de API
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Método genérico para realizar peticiones HTTP
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Configuración por defecto
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Añadir el token de autenticación si está disponible
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method: options.method || "GET",
      headers,
      credentials: "omit",
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    };

    try {
      const response = await fetch(url, config);

      // Comprueba si la respuesta es satisfactoria
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      // Para respuestas que no tienen contenido
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en la petición a ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos específicos para cada tipo de petición HTTP
  get<T>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T, D = unknown>(
    endpoint: string,
    data: D,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data,
    });
  }

  put<T, D = unknown>(
    endpoint: string,
    data: D,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: data });
  }

  patch<T, D = unknown>(
    endpoint: string,
    data: D,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data,
    });
  }

  delete<T>(
    endpoint: string,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Exportar una instancia del cliente
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
