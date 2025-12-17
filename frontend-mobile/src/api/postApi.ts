import { apiClient } from "./apiClient";
import { Post, CreatePostData, UpdatePostData } from "./types/post.types";

export const postApi = {
  getAll: async (): Promise<Post[]> => {
    return apiClient.get<Post[]>("/posts");
  },

  search: async (query: string): Promise<Post[]> => {
    return apiClient.get<Post[]>(
      `/posts/search?q=${encodeURIComponent(query)}`
    );
  },

  getById: async (id: string): Promise<Post> => {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  create: async (postData: CreatePostData): Promise<Post> => {
    return apiClient.post<Post>("/posts", postData);
  },

  update: async (id: string, postData: UpdatePostData): Promise<Post> => {
    return apiClient.put<Post>(`/posts/${id}`, postData);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/posts/${id}`);
  },
};
