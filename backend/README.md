# TuSalon - Backend

Backend API para TuSalon, una plataforma marketplace de salones de eventos y servicios relacionados (fotografía, DJ, wedding planners, catering, etc.).

## 🏗️ Tecnologías

- **Node.js** + **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para PostgreSQL
- **bcryptjs** - Encriptación de contraseñas
- **dotenv** - Variables de entorno

## 📊 Modelos de Base de Datos

### Usuarios (3 tipos)
- **Proveedor**: Publica salones y servicios
- **Cliente**: Busca y contrata salones/servicios
- **Admin**: Administrador del sistema

### Salones
- Información del salón (nombre, descripción, capacidad, precio)
- Ubicación completa (dirección, ciudad, provincia, país)
- **Coordenadas geográficas** (latitud/longitud) para búsqueda por radio
- Imágenes y servicios incluidos

### Servicios
- Tipos: fotografía, DJ, wedding planner, catering, decoración, música, video, flores, transporte, etc.
- Información del proveedor
- **Coordenadas geográficas** para búsqueda por radio
- Precio desde, imágenes, contacto

### Consultas/Reservas
- Conecta clientes con proveedores
- Estados: pendiente, contactado, confirmado, cancelado, completado
- Información del evento (fecha, número de invitados)
- Mensajes y respuestas

## 🚀 Configuración e Instalación

### Prerrequisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Paso 1: Instalar dependencias

```bash
cd backend
npm install
```

### Paso 2: Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tusalon_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

PORT=3000
NODE_ENV=development
```

### Paso 3: Crear la base de datos

Abre PostgreSQL y crea la base de datos:

```sql
CREATE DATABASE tusalon_db;
```

O desde la terminal:

```bash
createdb tusalon_db
```

### Paso 4: Ejecutar migraciones

Las migraciones crearán todas las tablas necesarias:

```bash
npm run migrate
```

### Paso 5: Cargar datos de ejemplo (opcional)

Para probar la aplicación con datos de ejemplo:

```bash
npm run seed
```

Esto creará:
- 4 usuarios (proveedores, clientes, admin)
- 3 salones en Buenos Aires
- 4 servicios (fotografía, DJ, wedding planner, catering)
- 2 consultas de ejemplo

**Credenciales de prueba:**
- Email: `proveedor1@tusalon.com` | Password: `password123`
- Email: `cliente1@tusalon.com` | Password: `password123`
- Email: `admin@tusalon.com` | Password: `password123`

### Paso 6: Iniciar el servidor

**Modo desarrollo** (con nodemon):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 🧪 Probar la API

### Health Check
```bash
curl http://localhost:3000/health
```

### Listar todos los salones
```bash
curl http://localhost:3000/api/v1/salones
```

### Listar todos los servicios
```bash
curl http://localhost:3000/api/v1/servicios
```

### Búsqueda por radio (ejemplo: salones a 5km del centro de Buenos Aires)
```bash
curl "http://localhost:3000/api/v1/salones/buscar?lat=-34.6037&lon=-58.3816&radio=5"
```

## 🗺️ Búsqueda Geográfica

El sistema incluye funcionalidades avanzadas de búsqueda por radio:

- **Fórmula de Haversine**: Calcula distancias precisas entre coordenadas
- **Bounding Box**: Optimiza búsquedas filtrando primero por área rectangular
- **Filtrado exacto**: Calcula distancia real y ordena por proximidad

### Ejemplo de uso:

```javascript
const { buscarSalones } = require('./utils/searchHelpers');

// Buscar salones a menos de 10km de un punto
const resultados = await buscarSalones(Salon, {
  latitud: -34.6037,
  longitud: -58.3816,
  radioKm: 10,
  capacidadMin: 100,  // Filtro adicional
  precioMax: 200000,  // Filtro adicional
});
```

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de Sequelize
├── migrations/              # Migraciones de base de datos
│   ├── 20231212000001-create-usuarios.js
│   ├── 20231212000002-create-salones.js
│   ├── 20231212000003-create-servicios.js
│   └── 20231212000004-create-consultas.js
├── models/                  # Modelos de Sequelize
│   ├── index.js
│   ├── Usuario.js
│   ├── Salon.js
│   ├── Servicio.js
│   └── Consulta.js
├── seeders/                 # Datos de ejemplo
│   └── sampleData.js
├── utils/                   # Utilidades
│   ├── geoUtils.js         # Cálculos geográficos
│   └── searchHelpers.js    # Helpers de búsqueda
├── .env.example            # Template de variables de entorno
├── .gitignore
├── .sequelizerc            # Configuración de Sequelize CLI
├── package.json
├── server.js               # Punto de entrada
└── README.md
```

## 🔄 Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Iniciar en modo desarrollo |
| `npm start` | Iniciar en modo producción |
| `npm run migrate` | Ejecutar migraciones |
| `npm run migrate:undo` | Revertir última migración |
| `npm run seed` | Cargar datos de ejemplo |

## 🔐 Seguridad

- Las contraseñas se encriptan con **bcryptjs**
- **Helmet.js** para headers de seguridad
- **CORS** configurado
- Validación de datos con **express-validator**

## 📝 Próximos Pasos

Este es el backend base. Puedes expandirlo con:

- [ ] Autenticación JWT
- [ ] API completa con CRUD para todos los modelos
- [ ] Upload de imágenes
- [ ] Sistema de pagos
- [ ] Notificaciones por email
- [ ] Rating y reseñas
- [ ] Frontend (React, Vue, etc.)
- [ ] Documentación con Swagger

## 🤝 Contribuir

Este es un proyecto base. Siéntete libre de mejorarlo y adaptarlo a tus necesidades.

## 📄 Licencia

ISC - Este proyecto es de código abierto para uso educativo y comercial.

---

**¿Problemas o preguntas?** Abre un issue en el repositorio.
