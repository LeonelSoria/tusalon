# TuSalon - Plataforma de Salones y Servicios para Eventos

Plataforma marketplace para publicar y contratar salones de eventos y servicios relacionados (fotografía, DJ, wedding planners, catering, decoración, etc.).

## 📋 Descripción

**TuSalon** es un sistema completo que conecta:
- **Proveedores**: Publican sus salones y servicios
- **Clientes**: Buscan y contratan salones y servicios para sus eventos
- **Funcionalidad clave**: Búsqueda geográfica por radio para encontrar opciones cercanas

## 🏗️ Estructura del Proyecto

```
tusalon/
├── backend/         # API REST con Node.js + Express + PostgreSQL
└── README.md        # Este archivo
```

## ✨ Características Principales

### Backend (API)
- ✅ Gestión de 3 tipos de usuarios (proveedores, clientes, admin)
- ✅ CRUD completo para salones y servicios
- ✅ **Búsqueda geográfica por radio** usando fórmula de Haversine
- ✅ Sistema de consultas/reservas entre clientes y proveedores
- ✅ Base de datos PostgreSQL con Sequelize ORM
- ✅ Migraciones y seeders para datos de ejemplo

### Modelos de Base de Datos

1. **Usuarios** (`proveedores`, `clientes`, `admin`)
2. **Salones** (con coordenadas geográficas)
3. **Servicios** (fotografía, DJ, wedding planner, catering, etc.)
4. **Consultas** (solicitudes de clientes a proveedores)

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v14+)
- PostgreSQL (v12+)
- Git

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd tusalon
   ```

2. **Configurar el backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de PostgreSQL
   ```

4. **Crear base de datos**
   ```sql
   createdb tusalon_db
   ```

5. **Ejecutar migraciones**
   ```bash
   npm run migrate
   ```

6. **Cargar datos de ejemplo** (opcional)
   ```bash
   npm run seed
   ```

7. **Iniciar servidor**
   ```bash
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3000`

## 📖 Documentación

Ver el [README del backend](./backend/README.md) para más detalles sobre:
- Configuración completa
- Estructura de la base de datos
- Endpoints de la API
- Búsqueda geográfica
- Ejemplos de uso

## 🧪 Datos de Prueba

Después de ejecutar `npm run seed`:

```
Email: proveedor1@tusalon.com | Password: password123
Email: cliente1@tusalon.com | Password: password123
Email: admin@tusalon.com | Password: password123
```

## 🗺️ Funcionalidades Geográficas

El sistema incluye búsqueda avanzada por radio:

```bash
# Buscar salones a menos de 5km del centro de Buenos Aires
curl "http://localhost:3000/api/v1/salones/buscar?lat=-34.6037&lon=-58.3816&radio=5"
```

## 📝 Roadmap

- [x] Backend API con modelos base
- [x] Búsqueda geográfica por radio
- [x] Sistema de consultas/reservas
- [ ] Autenticación JWT
- [ ] API completa con todos los endpoints
- [ ] Upload de imágenes
- [ ] Frontend (React/Vue)
- [ ] Sistema de pagos
- [ ] Notificaciones
- [ ] Rating y reseñas

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Contribuciones son bienvenidas.

## 📄 Licencia

ISC

---

**Desarrollado para conectar proveedores de eventos con clientes en todo el país** 🎉
