export interface User {
  _id: string;
  nome: string;
  email: string;
  role: "aluno" | "professor";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  nome: string;
  email: string;
  password: string;
  role: "aluno" | "professor";
}

export interface UpdateUserDto {
  nome?: string;
  email?: string;
  role?: "aluno" | "professor";
}

// Adicione ao arquivo api.types.ts se preferir
