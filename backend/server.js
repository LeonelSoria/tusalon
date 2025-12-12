require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'TuSalon API - Backend de plataforma de eventos',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api/v1',
        },
    });
});

// Health check
app.get('/health', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            database: 'Disconnected',
            error: error.message,
        });
    }
});

// API Routes - Ejemplo básico para verificar modelos
app.get('/api/v1/salones', async (req, res) => {
    try {
        const salones = await db.Salon.findAll({
            where: { activo: true },
            include: [
                {
                    model: db.Usuario,
                    as: 'proveedor',
                    attributes: ['nombre', 'apellido', 'email', 'telefono'],
                },
            ],
        });
        res.json(salones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/v1/servicios', async (req, res) => {
    try {
        const servicios = await db.Servicio.findAll({
            where: { activo: true },
            include: [
                {
                    model: db.Usuario,
                    as: 'proveedor',
                    attributes: ['nombre', 'apellido', 'email'],
                },
            ],
        });
        res.json(servicios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test de búsqueda por radio - Ejemplo
app.get('/api/v1/salones/buscar', async (req, res) => {
    try {
        const { lat, lon, radio } = req.query;

        if (!lat || !lon || !radio) {
            return res.status(400).json({
                error: 'Parámetros requeridos: lat, lon, radio',
            });
        }

        const { buscarSalones } = require('./utils/searchHelpers');

        const resultados = await buscarSalones(db.Salon, {
            latitud: parseFloat(lat),
            longitud: parseFloat(lon),
            radioKm: parseFloat(radio),
        });

        res.json({
            cantidad: resultados.length,
            resultados,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Iniciar servidor
async function startServer() {
    try {
        // Verificar conexión a la base de datos
        await db.sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            // Nota: usar migraciones en producción, no sync()
            // await db.sequelize.sync({ alter: true });
            console.log('ℹ️  Usa migraciones para crear/actualizar tablas: npm run migrate');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📚 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
