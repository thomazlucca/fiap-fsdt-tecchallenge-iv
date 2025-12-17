import { apiClient } from "./apiClient";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "./types/auth.types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/users/login", credentials);
  },

  register: async (userData: RegisterData): Promise<User> => {
    // Para registro, primeiro precisamos estar autenticados
    // Mas como obter o token? Vamos precisar ajustar depois
    return apiClient.post<User>("/users/register", userData);
  },

  logout: async (): Promise<void> => {
    // Se sua API tiver endpoint de logout
    // return apiClient.post('/auth/logout');
    return Promise.resolve();
  },
};
