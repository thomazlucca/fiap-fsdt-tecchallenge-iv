import { useState, useCallback } from "react";
import { userApi } from "../api";
import { User } from "../api/types/user.types";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: any) {
      console.error("Erro ao buscar usuários:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Não foi possível carregar os usuários";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
  };
};
