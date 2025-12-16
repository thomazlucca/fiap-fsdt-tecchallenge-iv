import { Router } from "express";
import * as controller from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";
import { isProfessor } from "../middlewares/isProfessor.js";

const router = Router();

/**
 * @swagger
 * /users/register:
 *  post:
 *   tags: [Users]
 *   security:
 *    - bearerAuth: []
 *   summary: Registro de novo usuário
 *   requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          required: [nome, email, senha, role]
 *          properties:
 *            nome:
 *              type: string
 *              example: João Silva
 *            email:
 *              type: string
 *              example: email@email.com
 *            senha:
 *              type: string
 *              example: senha123
 *            role:
 *              type: string
 *              enum: [aluno, professor]
 *              example: aluno
 *   responses:
 *    201:
 *     description: Usuário criado com sucesso
 *    403:
 *     description: Permissão negada para criação de usuário
 *    500:
 *     description: Erro ao registrar usuário
 */
router.post("/register", auth(), controller.register);

/**
 * @swagger
 * /users:
 *   get:
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      summary: Lista todos os usuários (autenticado)
 *      description: Retorna os usuários registrados (somente professor).
 *      responses:
 *        200:
 *          description: Lista de usuários retornada com sucesso
 *        500:
 *          description: Erro ao listar usuários
 */
router.get("/", auth(), isProfessor, controller.list);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 example: email@email.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       403:
 *         description: Permissão negada para criação de usuário
 *       500:
 *         description: Erro ao registrar usuário
 */
router.post("/login", controller.login);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *    tags: [Users]
 *    summary: Deleta um usuário (somente professor autenticado)
 *    security:
 *     - bearerAuth: []
 *    parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *        type: string
 *    responses:
 *     200:
 *      description: Usuário deletado com sucesso
 *     404:
 *      description: Usuário não encontrado
 *     500:
 *      description: Erro ao deletar Usuário
 */
router.delete("/:id", auth(), isProfessor, controller.deleteUser);

export default router;
