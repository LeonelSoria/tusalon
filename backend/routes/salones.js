const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Salon, Usuario } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { buscarSalones } = require('../utils/searchHelpers');

/**
 * @route   GET /api/v1/salones
 * @desc    Obtener todos los salones activos
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const salones = await Salon.findAll({
            where: { activo: true },
            include: [
                {
                    model: Usuario,
                    as: 'proveedor',
                    attributes: ['nombre', 'apellido', 'email', 'telefono'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({
            success: true,
            count: salones.length,
            data: salones,
        });
    } catch (error) {
        console.error('Error al obtener salones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener salones',
        });
    }
});

/**
 * @route   GET /api/v1/salones/buscar
 * @desc    Buscar salones por radio geográfico
 * @access  Public
 */
router.get('/buscar', async (req, res) => {
    try {
        const { lat, lon, radio, capacidadMin, precioMax, ciudad } = req.query;

        if (!lat || !lon || !radio) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros requeridos: lat, lon, radio',
            });
        }

        const filtros = {
            latitud: parseFloat(lat),
            longitud: parseFloat(lon),
            radioKm: parseFloat(radio),
        };

        if (capacidadMin) filtros.capacidadMin = parseInt(capacidadMin);
        if (precioMax) filtros.precioMax = parseFloat(precioMax);
        if (ciudad) filtros.ciudad = ciudad;

        const resultados = await buscarSalones(Salon, filtros);

        res.json({
            success: true,
            count: resultados.length,
            data: resultados,
        });
    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({
            success: false,
            error: 'Error en búsqueda de salones',
        });
    }
});

/**
 * @route   GET /api/v1/salones/:id
 * @desc    Obtener un salón por ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const salon = await Salon.findByPk(req.params.id, {
            include: [
                {
                    model: Usuario,
                    as: 'proveedor',
                    attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
                },
            ],
        });

        if (!salon) {
            return res.status(404).json({
                success: false,
                error: 'Salón no encontrado',
            });
        }

        res.json({
            success: true,
            data: salon,
        });
    } catch (error) {
        console.error('Error al obtener salón:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener salón',
        });
    }
});

/**
 * @route   POST /api/v1/salones
 * @desc    Crear nuevo salón
 * @access  Private (solo proveedores)
 */
router.post(
    '/',
    [
        protect,
        authorize('proveedor', 'admin'),
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('direccion').notEmpty().withMessage('La dirección es requerida'),
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

            const salonData = {
                ...req.body,
                usuarioId: req.user.id,
            };

            const salon = await Salon.create(salonData);

            res.status(201).json({
                success: true,
                data: salon,
            });
        } catch (error) {
            console.error('Error al crear salón:', error);
            res.status(500).json({
                success: false,
                error: 'Error al crear salón',
            });
        }
    }
);

/**
 * @route   PUT /api/v1/salones/:id
 * @desc    Actualizar salón
 * @access  Private (solo el proveedor dueño)
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const salon = await Salon.findByPk(req.params.id);

        if (!salon) {
            return res.status(404).json({
                success: false,
                error: 'Salón no encontrado',
            });
        }

        // Verificar que el usuario es el dueño o admin
        if (salon.usuarioId !== req.user.id && req.user.tipoUsuario !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para actualizar este salón',
            });
        }

        await salon.update(req.body);

        res.json({
            success: true,
            data: salon,
        });
    } catch (error) {
        console.error('Error al actualizar salón:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar salón',
        });
    }
});

/**
 * @route   DELETE /api/v1/salones/:id
 * @desc    Eliminar salón (soft delete)
 * @access  Private (solo el proveedor dueño)
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const salon = await Salon.findByPk(req.params.id);

        if (!salon) {
            return res.status(404).json({
                success: false,
                error: 'Salón no encontrado',
            });
        }

        // Verificar que el usuario es el dueño o admin
        if (salon.usuarioId !== req.user.id && req.user.tipoUsuario !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para eliminar este salón',
            });
        }

        // Soft delete
        await salon.update({ activo: false });

        res.json({
            success: true,
            message: 'Salón eliminado correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar salón:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar salón',
        });
    }
});

/**
 * @route   GET /api/v1/salones/mis-publicaciones
 * @desc    Obtener salones del usuario autenticado
 * @access  Private
 */
router.get('/usuario/mis-publicaciones', protect, async (req, res) => {
    try {
        const salones = await Salon.findAll({
            where: { usuarioId: req.user.id },
            order: [['createdAt', 'DESC']],
        });

        res.json({
            success: true,
            count: salones.length,
            data: salones,
        });
    } catch (error) {
        console.error('Error al obtener salones del usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener salones',
        });
    }
});

module.exports = router;
