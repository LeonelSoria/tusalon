const express = require('express');
const router = express.Router();
const { Favorito, Salon, Servicio, Usuario } = require('../models');
const auth = require('../middleware/auth');

// GET /api/v1/favoritos - Listar favoritos del usuario
router.get('/', auth, async (req, res) => {
    try {
        const { tipo } = req.query; // Opcional: filtrar por tipo

        const whereClause = { usuarioId: req.userId };
        if (tipo && ['salon', 'servicio'].includes(tipo)) {
            whereClause.tipoItem = tipo;
        }

        const favoritos = await Favorito.findAll({
            where: whereClause,
            include: [
                {
                    model: Salon,
                    as: 'salon',
                    required: false,
                    include: [{
                        model: Usuario,
                        as: 'proveedor',
                        attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
                    }]
                },
                {
                    model: Servicio,
                    as: 'servicio',
                    required: false,
                    include: [{
                        model: Usuario,
                        as: 'proveedor',
                        attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Formatear respuesta para incluir solo el item relevante
        const favoritosFormateados = favoritos.map(fav => {
            const favJson = fav.toJSON();
            const item = fav.tipoItem === 'salon' ? favJson.salon : favJson.servicio;

            return {
                id: favJson.id,
                tipoItem: favJson.tipoItem,
                itemId: favJson.itemId,
                createdAt: favJson.createdAt,
                item: item
            };
        });

        res.json({
            success: true,
            data: favoritosFormateados
        });
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener favoritos'
        });
    }
});

// POST /api/v1/favoritos - Agregar a favoritos
router.post('/', auth, async (req, res) => {
    try {
        const { tipoItem, itemId } = req.body;

        // Validaciones
        if (!tipoItem || !itemId) {
            return res.status(400).json({
                success: false,
                error: 'Tipo de item e ID son requeridos'
            });
        }

        if (!['salon', 'servicio'].includes(tipoItem)) {
            return res.status(400).json({
                success: false,
                error: 'Tipo de item debe ser "salon" o "servicio"'
            });
        }

        // Verificar que el item existe
        let itemExists = false;
        if (tipoItem === 'salon') {
            const salon = await Salon.findByPk(itemId);
            itemExists = !!salon;
        } else {
            const servicio = await Servicio.findByPk(itemId);
            itemExists = !!servicio;
        }

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                error: `${tipoItem === 'salon' ? 'Salón' : 'Servicio'} no encontrado`
            });
        }

        // Verificar si ya existe en favoritos
        const favoritoExistente = await Favorito.findOne({
            where: {
                usuarioId: req.userId,
                tipoItem,
                itemId
            }
        });

        if (favoritoExistente) {
            return res.status(400).json({
                success: false,
                error: 'Este item ya está en tus favoritos'
            });
        }

        // Crear favorito
        const favorito = await Favorito.create({
            usuarioId: req.userId,
            tipoItem,
            itemId
        });

        res.status(201).json({
            success: true,
            data: favorito,
            message: 'Agregado a favoritos'
        });
    } catch (error) {
        console.error('Error al agregar a favoritos:', error);

        // Manejar error de índice único
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'Este item ya está en tus favoritos'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al agregar a favoritos'
        });
    }
});

// DELETE /api/v1/favoritos/:id - Eliminar de favoritos
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const favorito = await Favorito.findOne({
            where: {
                id,
                usuarioId: req.userId // Solo puede eliminar sus propios favoritos
            }
        });

        if (!favorito) {
            return res.status(404).json({
                success: false,
                error: 'Favorito no encontrado'
            });
        }

        await favorito.destroy();

        res.json({
            success: true,
            message: 'Eliminado de favoritos'
        });
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar favorito'
        });
    }
});

// GET /api/v1/favoritos/check/:tipo/:id - Verificar si está en favoritos
router.get('/check/:tipo/:id', auth, async (req, res) => {
    try {
        const { tipo, id } = req.params;

        if (!['salon', 'servicio'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                error: 'Tipo debe ser "salon" o "servicio"'
            });
        }

        const favorito = await Favorito.findOne({
            where: {
                usuarioId: req.userId,
                tipoItem: tipo,
                itemId: id
            }
        });

        res.json({
            success: true,
            isFavorite: !!favorito,
            favoritoId: favorito ? favorito.id : null
        });
    } catch (error) {
        console.error('Error al verificar favorito:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar favorito'
        });
    }
});

module.exports = router;
