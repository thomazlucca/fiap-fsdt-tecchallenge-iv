import { apiClient } from "./apiClient";
import { CreateUserDto, UpdateUserDto, User } from "./types/user.types";

export { User } from "./types/user.types";

export const userApi = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>("/users");
  },

  async getById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, userData);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async create(userData: CreateUserDto): Promise<User> {
    return apiClient.post<User>("/users/register", userData);
    // Ou "/users" dependendo do seu endpoint
  },
};
