import * as repository from "../repositories/postRepository.js";

export const listPosts = () => repository.getAllPosts();

export const searchPosts = (query) => repository.searchPosts(query);

export const searchById = (id) => repository.getPostById(id);

export const editPost = (id, data) => repository.editPost(id, data);

export const create = (data) => repository.createPost(data);

export const deletePost = (id) => repository.deletePost(id);
