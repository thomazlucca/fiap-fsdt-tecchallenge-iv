import * as service from "../services/userService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    // usuário logado
    const userLogged = req.user;
    const { role } = req.body;

    // Se for aluno tentando criar professor: bloquear
    if (userLogged.role === "aluno" && role === "professor") {
      return res.status(403).json({
        error:
          "Você não tem permissão para criar usuários que sejam professores.",
      });
    }

    // Se quiser reforçar: aluno só pode criar aluno
    if (userLogged.role === "aluno" && role !== "aluno") {
      return res.status(403).json({
        error: "Alunos só podem criar usuários que sejam alunos.",
      });
    }

    const user = await service.register(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const login = await service.login(email, senha);
    if (!login) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }
    return res.status(200).json(login);
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro no servidor!" });
  }
};

export const list = async (req, res) => {
  try {
    // Obtém o role do usuário autenticado
    const userRole = req.user.role;
    
    // Passa o role para o service
    const users = await service.listUsers(userRole);
    
    return res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return res.status(500).json({ error: "Erro ao listar usuários." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const authenticatedUser = req.user; // Usuário autenticado (do token)
    
    // Chama o service passando o usuário autenticado
    const updatedUser = await service.updateUser(id, req.body, authenticatedUser);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    
    return res.status(200).json({
      message: "Usuário atualizado com sucesso",
      usuario: updatedUser
    });
  } catch (error) {
    console.error("Erro no controller ao atualizar usuário:", error);
    
    // Tratamento de erros específicos
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
        
    return res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleteUser = await service.deleteUser(req.params.id);
    if (!deleteUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    return res.status(200).json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar usuário." });
  }
};
