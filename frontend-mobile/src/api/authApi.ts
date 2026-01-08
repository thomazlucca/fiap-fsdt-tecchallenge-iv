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
    return apiClient.post<User>("/users/register", userData);
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },
};
