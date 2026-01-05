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

    // REGRAS PARA ALUNOS:
    if (authenticatedUser.role === "aluno") {
      // Alunos só podem editar outros alunos (não podem editar professores)
      if (userToUpdate.role !== "aluno") {
        throw new Error("Alunos só podem editar outros alunos");
      }
      
      // Alunos NÃO podem alterar o role de ninguém
      if (data.role) {
        throw new Error("Alunos não podem alterar o tipo de usuário");
      }
    }

    // REGRAS PARA PROFESSORES:
    // Professores podem editar qualquer usuário (alunos e professores)
    // e podem alterar o role

    // Verifica se email já existe
    if (data.email && data.email !== userToUpdate.email) {
      const existingUser = await repository.findByEmail(data.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new Error("Este email já está em uso");
      }
    }

    // Criptografa senha se fornecida
    if (data.senha) {
      const salt = await bcrypt.genSalt(10);
      data.senha = await bcrypt.hash(data.senha, salt);
    }

    // Atualiza usuário
    const updatedUser = await repository.updateUser(id, data);
    
    return updatedUser;
  } catch (error) {
    console.error("Erro no service ao atualizar usuário:", error);
    throw error;
  }
};

export const deleteUser = (id) => repository.deleteUser(id);