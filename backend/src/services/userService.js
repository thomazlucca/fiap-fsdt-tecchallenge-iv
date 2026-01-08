import * as repository from "../repositories/userRepository.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

export const listUsers = (authenticatedUserRole) => {
  if (authenticatedUserRole === "professor") {
    return repository.listAllUsers();
  }

  if (authenticatedUserRole === "aluno") {
    return repository.listAlunos();
  }

  throw new Error("Role do usuário não especificado ou inválido");
};

export const findByEmail = (email) => repository.findByEmail(email);

export const updateUser = async (id, data, authenticatedUser) => {
  try {
    const userToUpdate = await repository.getUserById(id);
    if (!userToUpdate) {
      throw new Error("Usuário não encontrado");
    }

    if (authenticatedUser.role === "aluno") {
      if (userToUpdate.role !== "aluno") {
        throw new Error("Alunos só podem editar outros alunos");
      }

      if (data.role) {
        throw new Error("Alunos não podem alterar o tipo de usuário");
      }
    }

    if (data.email && data.email !== userToUpdate.email) {
      const existingUser = await repository.findByEmail(data.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new Error("Este email já está em uso");
      }
    }

    if (data.senha) {
      const salt = await bcrypt.genSalt(10);
      data.senha = await bcrypt.hash(data.senha, salt);
    }

    const updatedUser = await repository.updateUser(id, data);

    return updatedUser;
  } catch (error) {
    console.error("Erro no service ao atualizar usuário:", error);
    throw error;
  }
};

export const getUserById = async (id, authenticatedUser) => {
  try {
    const user = await repository.getUserById(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (authenticatedUser.role === "professor") {
      return user;
    }

    if (authenticatedUser.role === "aluno") {
      if (user.role !== "aluno") {
        throw new Error("Você não tem permissão para visualizar este usuário");
      }
      return user;
    }

    throw new Error("Role do usuário não especificado ou inválido");
  } catch (error) {
    console.error("Erro no service ao buscar usuário:", error);
    throw error;
  }
};

export const deleteUser = (id) => repository.deleteUser(id);
