import { apiClient } from "./apiClient";
import { User } from "./types/user.types";

export { User } from "./types/user.types";

export const userApi = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>("/users");
  },

  async getById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
