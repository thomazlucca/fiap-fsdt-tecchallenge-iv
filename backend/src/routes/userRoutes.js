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
 *              example: Aluno Teste
 *            email:
 *              type: string
 *              example: aluno@email.com
 *            senha:
 *              type: string
 *              example: 123456
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
 *      summary: Lista usuários conforme permissão
 *      description: |
 *        Retorna os usuários registrados conforme o role do usuário autenticado:
 *        - Professores veem todos os usuários (alunos e professores)
 *        - Alunos veem apenas outros alunos
 *      responses:
 *        200:
 *          description: Lista de usuários retornada com sucesso
 *        500:
 *          description: Erro ao listar usuários
 */
router.get("/", auth(), controller.list);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     summary: Busca um usuário por ID
 *     description: |
 *       Retorna os dados de um usuário específico conforme permissões:
 *       - Professores podem ver qualquer usuário (alunos e professores)
 *       - Alunos podem ver apenas outros alunos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário a ser buscado
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [aluno, professor]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: |
 *           Permissão negada. Possíveis motivos:
 *           - Aluno tentando visualizar professor
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao buscar usuário
 */
router.get("/:id", auth(), controller.getUserById);

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
 *                 example: aluno@email.com
 *               senha:
 *                 type: string
 *                 example: 123456
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
 *   put:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     summary: Atualiza um usuário
 *     description: |
 *       Atualiza os dados de um usuário.
 *       - Alunos só podem editar seu próprio perfil e não podem alterar o role
 *       - Professores só podem editar outros professores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva ALTERADO
 *               email:
 *                 type: string
 *                 example: emailnovo@email.com
 *               senha:
 *                 type: string
 *                 example: 654321
 *               role:
 *                 type: string
 *                 enum: [aluno, professor]
 *                 example: aluno
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       403:
 *         description: |
 *           Permissão negada. Possíveis motivos:
 *           - Aluno tentando editar outro usuário
 *           - Aluno tentando alterar role
 *           - Professor tentando editar aluno
 *           - Email já está em uso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao atualizar usuário
 */
router.put("/:id", auth(), controller.updateUser);

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
