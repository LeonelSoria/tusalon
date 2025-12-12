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

// Import routes
const authRoutes = require('./routes/auth');
const salonesRoutes = require('./routes/salones');
const serviciosRoutes = require('./routes/servicios');
const consultasRoutes = require('./routes/consultas');

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'TuSalon API - Backend de plataforma de eventos',
        version: '2.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/v1/auth',
            salones: '/api/v1/salones',
            servicios: '/api/v1/servicios',
            consultas: '/api/v1/consultas',
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

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/salones', salonesRoutes);
app.use('/api/v1/servicios', serviciosRoutes);
app.use('/api/v1/consultas', consultasRoutes);

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

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📚 Health check: http://localhost:${PORT}/health`);
            console.log(`🔐 Auth: http://localhost:${PORT}/api/v1/auth`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
