import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api";
import { User, LoginCredentials, RegisterData } from "../api/types/auth.types";

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isProfessor: boolean;
  loading: boolean;
  authLoading: boolean;
  signIn: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  signUp: (
    userData: RegisterData
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user_data");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar usuário do storage:", error);
      } finally {
        setBootstrapping(false);
      }
    };

    loadStoredUser();
  }, []);

  const signIn = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthLoading(true);

      const response = await authApi.login(credentials);

      await AsyncStorage.setItem("@auth_token", response.token);
      await AsyncStorage.setItem("@user_data", JSON.stringify(response.user));

      setUser(response.user);

      return { success: true, message: "Login realizado com sucesso!" };
    } catch (error: unknown) {
      console.error("Erro no login:", error);

      let message = "Erro ao fazer login";
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as any;
        if (err.response?.status === 401) {
          message = "Email ou senha incorretos";
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        }
      }

      return { success: false, message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (
    userData: RegisterData
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthLoading(true);

      return {
        success: false,
        message:
          "Registro temporariamente desabilitado. Use as credenciais do seed.",
      };
    } catch (error: unknown) {
      console.error("Erro no registro:", error);
      return { success: false, message: "Erro ao criar usuário" };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setAuthLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      await AsyncStorage.multiRemove(["@auth_token", "@user_data"]);
      setUser(null);
      setAuthLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isProfessor = user?.role === "professor";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isProfessor,
        loading: bootstrapping,
        authLoading,
        signIn,
        signOut,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
