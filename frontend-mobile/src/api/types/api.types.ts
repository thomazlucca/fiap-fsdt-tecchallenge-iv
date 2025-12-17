export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface Post {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  createdAt: string;
  updatedAt: string;
}
