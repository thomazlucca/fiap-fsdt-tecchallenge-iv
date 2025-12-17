import { useState, useCallback } from "react";
import { postApi } from "../api";
import { Post } from "../api/types/post.types";

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await postApi.getAll();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar posts");
      console.error("Erro ao buscar posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      await postApi.delete(id);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      return true;
    } catch (err: any) {
      console.error("Erro ao excluir post:", err);
      return false;
    }
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    deletePost,
  };
};
