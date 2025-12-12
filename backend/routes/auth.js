const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Usuario } = require('../models');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('tipoUsuario').isIn(['proveedor', 'cliente']).withMessage('Tipo de usuario inválido'),
    ],
    async (req, res) => {
        try {
            // Validar errores
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { email, password, nombre, apellido, telefono, tipoUsuario } = req.body;

            // Verificar si el usuario ya existe
            const usuarioExiste = await Usuario.findOne({ where: { email } });
            if (usuarioExiste) {
                return res.status(400).json({
                    success: false,
                    error: 'El email ya está registrado',
                });
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear usuario
            const usuario = await Usuario.create({
                email,
                password: hashedPassword,
                nombre,
                apellido,
                telefono,
                tipoUsuario,
                verificado: false,
                activo: true,
            });

            // Generar token JWT
            const token = jwt.sign(
                { id: usuario.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.status(201).json({
                success: true,
                token,
                user: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    tipoUsuario: usuario.tipoUsuario,
                },
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                error: 'Error al registrar usuario',
            });
        }
    }
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').notEmpty().withMessage('La contraseña es requerida'),
    ],
    async (req, res) => {
        try {
            // Validar errores
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;

            // Buscar usuario por email
            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas',
                });
            }

            // Verificar contraseña
            const passwordMatch = await bcrypt.compare(password, usuario.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas',
                });
            }

            // Verificar si el usuario está activo
            if (!usuario.activo) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario desactivado',
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { id: usuario.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    tipoUsuario: usuario.tipoUsuario,
                },
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                error: 'Error al iniciar sesión',
            });
        }
    }
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                nombre: req.user.nombre,
                apellido: req.user.apellido,
                telefono: req.user.telefono,
                tipoUsuario: req.user.tipoUsuario,
                verificado: req.user.verificado,
            },
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener usuario',
        });
    }
});

module.exports = router;
