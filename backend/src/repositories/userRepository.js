import { User } from "../models/userModel.js";

export const createUser = (data) => User.create(data);
export const findByEmail = (email) => User.findOne({ email });
export const getUserById = (id) => User.findById(id);

export const listAllUsers = () => User.find();

export const listAlunos = () => User.find({ role: "aluno" });

export const listProfessores = () => User.find({ role: "professor" });

export const updateUser = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
export const deleteUser = (id) => User.findByIdAndDelete(id);
