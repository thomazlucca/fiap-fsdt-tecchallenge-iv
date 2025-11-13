import { Post } from "../models/postModel.js";

export const getAllPosts = () => Post.find();
export const getPostById = (id) => Post.findById(id);
export const createPost = (data) => Post.create(data);
export const editPost = (id, data) =>
  Post.findByIdAndUpdate(id, data, { new: true });

export const searchPosts = (query) =>
  Post.find({
    $or: [
      { titulo: { $regex: query, $options: "i" } },
      { conteudo: { $regex: query, $options: "i" } },
      { autor: { $regex: query, $options: "i" } },
    ],
  });

export const deletePost = (id) => Post.findByIdAndDelete(id);
