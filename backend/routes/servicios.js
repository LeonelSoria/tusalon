const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Servicio, Usuario } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { buscarServicios } = require('../utils/searchHelpers');

/**
 * @route   GET /api/v1/servicios
 * @desc    Obtener todos los servicios activos
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { tipo } = req.query;
        const where = { activo: true };

        if (tipo) {
            where.tipo = tipo;
        }

        const servicios = await Servicio.findAll({
            where,
            include: [
                {
                    model: Usuario,
                    as: 'proveedor',
                    attributes: ['nombre', 'apellido', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({
            success: true,
            count: servicios.length,
            data: servicios,
        });
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener servicios',
        });
    }
});

/**
 * @route   GET /api/v1/servicios/:id
 * @desc    Obtener un servicio por ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id, {
            include: [
                {
                    model: Usuario,
                    as: 'proveedor',
                    attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
                },
            ],
        });

        if (!servicio) {
            return res.status(404).json({
                success: false,
                error: 'Servicio no encontrado',
            });
        }

        res.json({
            success: true,
            data: servicio,
        });
    } catch (error) {
        console.error('Error al obtener servicio:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener servicio',
        });
    }
});

/**
 * @route   POST /api/v1/servicios
 * @desc    Crear nuevo servicio
 * @access  Private (solo proveedores)
 */
router.post(
    '/',
    [
        protect,
        authorize('proveedor', 'admin'),
        body('tipo').isIn(['fotografia', 'dj', 'wedding_planner', 'catering', 'decoracion', 'musica', 'video', 'flores', 'transporte', 'animacion', 'otros']).withMessage('Tipo de servicio inválido'),
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('ciudad').notEmpty().withMessage('La ciudad es requerida'),
        body('provincia').notEmpty().withMessage('La provincia es requerida'),
        body('latitud').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
        body('longitud').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const servicioData = {
                ...req.body,
                usuarioId: req.user.id,
            };

            const servicio = await Servicio.create(servicioData);

            res.status(201).json({
                success: true,
                data: servicio,
            });
        } catch (error) {
            console.error('Error al crear servicio:', error);
            res.status(500).json({
                success: false,
                error: 'Error al crear servicio',
            });
        }
    }
);

/**
 * @route   PUT /api/v1/servicios/:id
 * @desc    Actualizar servicio
 * @access  Private (solo el proveedor dueño)
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);

        if (!servicio) {
            return res.status(404).json({
                success: false,
                error: 'Servicio no encontrado',
            });
        }

        // Verificar que el usuario es el dueño o admin
        if (servicio.usuarioId !== req.user.id && req.user.tipoUsuario !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para actualizar este servicio',
            });
        }

        await servicio.update(req.body);

        res.json({
            success: true,
            data: servicio,
        });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar servicio',
        });
    }
});

/**
 * @route   DELETE /api/v1/servicios/:id
 * @desc    Eliminar servicio (soft delete)
 * @access  Private (solo el proveedor dueño)
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);

        if (!servicio) {
            return res.status(404).json({
                success: false,
                error: 'Servicio no encontrado',
            });
        }

        // Verificar que el usuario es el dueño o admin
        if (servicio.usuarioId !== req.user.id && req.user.tipoUsuario !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para eliminar este servicio',
            });
        }

        // Soft delete
        await servicio.update({ activo: false });

        res.json({
            success: true,
            message: 'Servicio eliminado correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar servicio',
        });
    }
});

/**
 * @route   GET /api/v1/servicios/usuario/mis-publicaciones
 * @desc    Obtener servicios del usuario autenticado
 * @access  Private
 */
router.get('/usuario/mis-publicaciones', protect, async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            where: { usuarioId: req.user.id },
            order: [['createdAt', 'DESC']],
        });

        res.json({
            success: true,
            count: servicios.length,
            data: servicios,
        });
    } catch (error) {
        console.error('Error al obtener servicios del usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener servicios',
        });
    }
});

module.exports = router;
