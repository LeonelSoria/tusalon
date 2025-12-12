const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Consulta, Salon, Servicio, Usuario } = require('../models');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/v1/consultas
 * @desc    Crear nueva consulta/reserva
 * @access  Private
 */
router.post(
    '/',
    [
        protect,
        body('proveedorId').notEmpty().withMessage('El ID del proveedor es requerido'),
        body('tipoConsulta').isIn(['salon', 'servicio']).withMessage('Tipo de consulta inválido'),
        body('mensaje').notEmpty().withMessage('El mensaje es requerido'),
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

            const consultaData = {
                ...req.body,
                clienteId: req.user.id,
                estado: 'pendiente',
            };

            const consulta = await Consulta.create(consultaData);

            res.status(201).json({
                success: true,
                data: consulta,
            });
        } catch (error) {
            console.error('Error al crear consulta:', error);
            res.status(500).json({
                success: false,
                error: 'Error al crear consulta',
            });
        }
    }
);

/**
 * @route   GET /api/v1/consultas/mis-consultas
 * @desc    Obtener consultas del usuario (como cliente o proveedor)
 * @access  Private
 */
router.get('/mis-consultas', protect, async (req, res) => {
    try {
        const { tipo } = req.query; // 'enviadas' o 'recibidas'

        let where = {};
        if (tipo === 'enviadas' || req.user.tipoUsuario === 'cliente') {
            where.clienteId = req.user.id;
        } else if (tipo === 'recibidas' || req.user.tipoUsuario === 'proveedor') {
            where.proveedorId = req.user.id;
        }

        const consultas = await Consulta.findAll({
            where,
            include: [
                {
                    model: Usuario,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
                },
                {
                    model: Usuario,
                    as: 'proveedor',
                    attributes: ['id', 'nombre', 'apellido', 'email'],
                },
                {
                    model: Salon,
                    as: 'salon',
                    attributes: ['id', 'nombre', 'ciudad'],
                },
                {
                    model: Servicio,
                    as: 'servicio',
                    attributes: ['id', 'nombre', 'tipo', 'ciudad'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({
            success: true,
            count: consultas.length,
            data: consultas,
        });
    } catch (error) {
        console.error('Error al obtener consultas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener consultas',
        });
    }
});

/**
 * @route   PUT /api/v1/consultas/:id
 * @desc    Actualizar estado de consulta (proveedores pueden responder)
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const consulta = await Consulta.findByPk(req.params.id);

        if (!consulta) {
            return res.status(404).json({
                success: false,
                error: 'Consulta no encontrada',
            });
        }

        // Solo el proveedor o el cliente pueden actualizar
        if (consulta.proveedorId !== req.user.id && consulta.clienteId !== req.user.id && req.user.tipoUsuario !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para actualizar esta consulta',
            });
        }

        // Si es el proveedor respondiendo, agregar fecha de respuesta
        if (consulta.proveedorId === req.user.id && req.body.respuestaProveedor) {
            req.body.fechaRespuesta = new Date();
            if (consulta.estado === 'pendiente') {
                req.body.estado = 'contactado';
            }
        }

        await consulta.update(req.body);

        res.json({
            success: true,
            data: consulta,
        });
    } catch (error) {
        console.error('Error al actualizar consulta:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar consulta',
        });
    }
});

module.exports = router;
