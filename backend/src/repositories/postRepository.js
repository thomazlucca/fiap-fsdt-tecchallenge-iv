import { Post } from "../models/postModel.js";
import mongoose from "mongoose";

export const getAllPosts = () => Post.find().populate("autor", "nome");
export const getPostById = (id) => Post.findById(id).populate("autor", "nome");
export const createPost = (data) => Post.create(data);
export const editPost = (id, data) =>
  Post.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
    "autor",
    "nome"
  );

export const searchPosts = async (query) => {
  const User = mongoose.model("User");
  const users = await User.find({
    nome: { $regex: query, $options: "i" },
  }).select("_id");

  const userIds = users.map((user) => user._id);

  return Post.find({
    $or: [
      { titulo: { $regex: query, $options: "i" } },
      { conteudo: { $regex: query, $options: "i" } },
      { autor: { $in: userIds } },
    ],
  })
    .populate("autor", "nome")
    .sort({ createdAt: -1 });
};

export const deletePost = (id) => Post.findByIdAndDelete(id);
