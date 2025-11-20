import { Router } from 'express';
import * as usuarioController from '../controller/usuarioController';
import { authenticateToken, authenticateOwner, authenticateRefreshToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - username
 *         - gmail
 *         - password
 *         - birthday
 *       properties:
 *         _id:
 *           type: string
 *           description: ID automático generado por MongoDB
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *         gmail:
 *           type: string
 *           description: Correo electrónico único
 *         password:
 *           type: string
 *           description: Contraseña encriptada
 *         birthday:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         rol:
 *           type: string
 *           enum: [user]
 *           default: user
 *           description: Rol del usuario
 *       example:
 *         username: "juanperez"
 *         gmail: "juan@example.com"
 *         password: "miContraseña123"
 *         birthday: "1990-05-15"
 *         rol: "user"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "juanperez"
 *         password:
 *           type: string
 *           example: "miContraseña123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         User:
 *           $ref: '#/components/schemas/Usuario'
 *         message:
 *           type: string
 *           example: "LOGIN EXITOSO"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestión de usuarios
 */

// ==================== RUTAS PÚBLICAS ====================

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "USUARIO CREADO CON EXITO"
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Error en los datos de entrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', usuarioController.createUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', usuarioController.login);

/**
 * @swagger
 * /user/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nuevo token generado"
 *                 token:
 *                   type: string
 *       401:
 *         description: Token de refresh inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/refresh', authenticateRefreshToken, usuarioController.refreshAccessToken);

// ==================== RUTAS PARA USUARIOS AUTENTICADOS ====================

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Obtener todos los usuarios (Requiere autenticación)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado - Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.get('/', authenticateToken, usuarioController.getAllUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (Requiere autenticación)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado - Token requerido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', authenticateToken, usuarioController.getUserById);

// ==================== RUTAS PARA PROPIETARIO ====================

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Actualizar un usuario por ID (Requiere ser el propietario)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado - Token requerido
 *       403:
 *         description: No tienes permisos para realizar esta acción
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', authenticateOwner, usuarioController.updateUserById);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID (Requiere ser el propietario)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado - Token requerido
 *       403:
 *         description: No tienes permisos para realizar esta acción
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', authenticateOwner, usuarioController.deleteUserById);

export default router;