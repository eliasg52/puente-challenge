export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
