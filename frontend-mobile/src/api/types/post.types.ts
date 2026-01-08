export interface Post {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string | { _id: string; nome: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  titulo: string;
  conteudo: string;
  autor?: string;
}

export interface UpdatePostData extends Partial<CreatePostData> {}
