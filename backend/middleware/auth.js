const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Middleware para proteger rutas que requieren autenticación
 */
const protect = async (req, res, next) => {
    let token;

    // Verificar si el token está en el header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Verificar si el token existe
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado para acceder a esta ruta',
        });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Obtener usuario del token
        req.user = await Usuario.findByPk(decoded.id, {
            attributes: { exclude: ['password'] },
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Token inválido o expirado',
        });
    }
};

/**
 * Middleware para autorizar tipos específicos de usuario
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.tipoUsuario)) {
            return res.status(403).json({
                success: false,
                error: `El tipo de usuario ${req.user.tipoUsuario} no está autorizado para acceder a esta ruta`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
