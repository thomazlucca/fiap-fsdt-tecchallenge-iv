import { Router } from "express";
import * as controller from "../controllers/postController.js";
import { auth } from "../middlewares/auth.js";
import { isProfessor } from "../middlewares/isProfessor.js";

const router = Router();

/**
 * @swagger
 * /posts:
 *  get:
 *    tags: [Posts]
 *    summary: Lista todos os posts
 *    responses:
 *      200:
 *        description: Lista de posts retornada com sucesso.
 *      500:
 *       description: Erro ao listar posts.
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Busca posts por palavra-chave (titulo, conteudo ou autor)
 *     tags: [Posts]
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: Palavra para busca
 *         schema:
 *           type: string
 *           example: post
 *     responses:
 *       200:
 *         description: Lista de posts encontrados
 *       404:
 *         description: Não há posts com a palavra chave informada
 *       500:
 *         description: Erro ao buscar posts
 */
router.get("/search", controller.search);

/**
 * @swagger
 * /posts/{id}:
 *  get:
 *    summary: Busca um post por ID
 *    tags: [Posts]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Post encontrado com sucesso.
 *      404:
 *        description: Post não encontrado.
 *      500:
 *        description: Erro interno do servidor.
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria um novo post (somente professor autenticado)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, conteudo, autor]
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Introdução ao MongoDB
 *               conteudo:
 *                 type: string
 *                 example: Conteúdo detalhado do post...
 *               autor:
 *                 type: string
 *                 example: Professor João
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *       401:
 *         description: Apenas professores podem criar posts
 *       500:
 *         description: Erro ao criar post
 */
router.post("/", auth(), isProfessor, controller.create);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Atualiza um post (autenticado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *               autor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post atualizado
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Post não encontrado
 *       500:
 *         description: Erro ao editar post
 */
router.put("/:id", auth(), isProfessor, controller.editPost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *    tags: [Posts]
 *    summary: Deleta um post (somente professor autenticado)
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
 *      description: Post deletado com sucesso
 *     404:
 *      description: Post não encontrado
 *     500:
 *      description: Erro ao deletar post
 */
router.delete("/:id", auth(), isProfessor, controller.deletePost);

export default router;
