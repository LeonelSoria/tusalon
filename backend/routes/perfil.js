const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const auth = require('../middleware/auth');

// GET /api/v1/perfil - Obtener datos del usuario autenticado
router.get('/', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: usuario
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener perfil'
        });
    }
});

// PUT /api/v1/perfil - Actualizar datos del perfil
router.put('/', auth, async (req, res) => {
    try {
        const { nombre, apellido, email, telefono } = req.body;

        const usuario = await Usuario.findByPk(req.userId);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Verificar si el email ya existe (si se está cambiando)
        if (email && email !== usuario.email) {
            const emailExists = await Usuario.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    error: 'El email ya está en uso'
                });
            }
        }

        // Actualizar solo los campos proporcionados
        if (nombre !== undefined) usuario.nombre = nombre;
        if (apellido !== undefined) usuario.apellido = apellido;
        if (email !== undefined) usuario.email = email;
        if (telefono !== undefined) usuario.telefono = telefono;

        await usuario.save();

        // Retornar usuario sin password
        const usuarioActualizado = usuario.toJSON();
        delete usuarioActualizado.password;

        res.json({
            success: true,
            data: usuarioActualizado,
            message: 'Perfil actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar perfil'
        });
    }
});

// POST /api/v1/perfil/cambiar-contrasena - Cambiar contraseña
router.post('/cambiar-contrasena', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validaciones
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }

        const usuario = await Usuario.findByPk(req.userId);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, usuario.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        usuario.password = hashedPassword;
        await usuario.save();

        res.json({
            success: true,
            message: 'Contraseña cambiada correctamente'
        });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar contraseña'
        });
    }
});

// POST /api/v1/perfil/foto - Subir foto de perfil
router.post('/foto', auth, async (req, res) => {
    try {
        const { fotoBase64 } = req.body;

        if (!fotoBase64) {
            return res.status(400).json({
                success: false,
                error: 'Foto es requerida'
            });
        }

        const usuario = await Usuario.findByPk(req.userId);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Guardar la foto en base64 directamente en la BD
        // En producción, deberías guardar en sistema de archivos o cloud storage
        usuario.foto = fotoBase64;
        await usuario.save();

        res.json({
            success: true,
            data: { foto: usuario.foto },
            message: 'Foto actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar foto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar foto'
        });
    }
});

module.exports = router;
