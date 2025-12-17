export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  role: "aluno" | "professor";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  _id: string;
  nome: string;
  email: string;
  role: "aluno" | "professor";
  createdAt: string;
  updatedAt: string;
}
