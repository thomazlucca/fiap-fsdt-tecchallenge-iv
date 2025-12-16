import * as repository from "../repositories/userRepository.js";
import jwt from "jsonwebtoken";

export const register = (data) => repository.createUser(data);

export const login = async (email, senha) => {
  const user = await repository.findByEmail(email);
  if (!user) return null;

  const senhaValida = await user.compararSenha(senha);
  if (!senhaValida) return null;

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
};

export const listUsers = () => repository.listUsers();

export const findByEmail = (email) => repository.findByEmail(email);

export const deleteUser = (id) => repository.deleteUser(id);
