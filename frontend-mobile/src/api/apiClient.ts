import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../utils/apiConfig";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Adiciona token automaticamente
    this.client.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // Clonar config para evitar mutações
        const newConfig = { ...config };

        if (!newConfig.headers) {
          newConfig.headers = {};
        }

        try {
          const token = await AsyncStorage.getItem("@auth_token");
          if (token) {
            newConfig.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn("Erro ao obter token:", error);
        }

        return newConfig;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Trata erros de autenticação
    this.client.interceptors.response.use(
      (response) => {
        console.log("✅", response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.log("❌ API Error:", {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });

        // Se token expirou (401), limpar storage
        if (error.response?.status === 401) {
          await AsyncStorage.multiRemove(["@auth_token", "@user_data"]);
          // Emitir evento de logout (vamos implementar no contexto)
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP tipados
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
