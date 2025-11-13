import * as service from "../services/postService.js";

export const getAll = async (req, res) => {
  try {
    const posts = await service.listPosts();
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Erro ao listar posts.");
    return res.status(500).json({ error: "Erro ao listar posts." });
  }
};

export const create = async (req, res) => {
  try {
    const newPost = await service.create(req.body);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Erro ao criar post:", error);
    return res.status(500).json({ error: "Erro ao criar post!" });
  }
};

export const search = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await service.searchPosts(q);
    if (!results) {
      return res
        .status(404)
        .json({ message: "Não há posts com a palavra chave informada." });
    }
    return res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return res.status(500).json({ error: "Erro ao buscar posts." });
  }
};

export const getById = async (req, res) => {
  try {
    const result = await service.searchById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Post não encontrado." });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar id.", error);
    return res.status(500).json({ error: "Erro ao buscar ID." });
  }
};

export const editPost = async (req, res) => {
  try {
    const editedPost = await service.editPost(req.params.id, req.body);
    if (!editedPost) {
      return res.status(404).json({ message: "Post não encontrado." });
    }
    return res.status(200).json(editedPost);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao editar post." });
  }
};

export const deletePost = async (req, res) => {
  try {
    const deletedPost = await service.deletePost(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post não encontrado." });
    }
    return res.status(200).json({ message: "Post deletado com sucesso." });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar post." });
  }
};
