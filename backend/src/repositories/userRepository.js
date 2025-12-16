import { User } from "../models/userModel.js";

export const createUser = (data) => User.create(data);
export const findByEmail = (email) => User.findOne({ email });
export const getUserById = (id) => User.findById(id);
export const listUsers = () => User.find();
export const deleteUser = (id) => User.findByIdAndDelete(id);
