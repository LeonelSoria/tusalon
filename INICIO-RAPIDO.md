# 🚀 Inicio Rápido - TuSalon

## ⚡ Configuración Rápida (5 minutos)

### Paso 1: Verificar Prerrequisitos

```powershell
# Ejecutar script de diagnóstico
.\check-postgres.ps1
```

### Paso 2: Instalar PostgreSQL (si no está instalado)

**Opción A - Instalación Estándar**:
1. Descargar desde: https://www.postgresql.org/download/windows/
2. Instalar con contraseña: `postgres`
3. Verificar: `psql --version`

**Opción B - Docker**:
```powershell
docker run --name tusalon-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tusalon_db -p 5432:5432 -d postgres:16
```

📖 Guía detallada: Ver `postgresql_installation_guide.md` en `.gemini/antigravity/brain/`

### Paso 3: Ejecutar Configuración Automática

```powershell
.\setup-tusalon.ps1
```

Este script:
- ✅ Verifica dependencias
- ✅ Crea la base de datos
- ✅ Ejecuta migraciones
- ✅ Carga datos de ejemplo
- ✅ Inicia el servidor backend

### Paso 4: Iniciar Frontend (nueva terminal)

```powershell
cd frontend
npx http-server -p 8080 -o
```

### Paso 5: Acceder a la Aplicación

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:8080

**Credenciales de prueba**:
- Proveedor: `proveedor1@tusalon.com` / `password123`
- Cliente: `cliente1@tusalon.com` / `password123`
- Admin: `admin@tusalon.com` / `password123`

---

## 📋 Estado Actual del Proyecto

✅ **Completado**:
- Node.js v22.11.0 verificado
- 234 dependencias npm instaladas
- Archivo `.env` configurado
- Scripts de automatización creados
- Documentación completa

⏳ **Pendiente** (requiere PostgreSQL):
- Crear base de datos
- Ejecutar migraciones
- Cargar datos de ejemplo
- Iniciar servidores

---

## 🛠️ Comandos Útiles

### Desarrollo
```powershell
# Backend (modo desarrollo con auto-reload)
cd backend
npm run dev

# Frontend
cd frontend
npx http-server -p 8080 -o
```

### Base de Datos
```powershell
cd backend

# Ejecutar migraciones
npm run migrate

# Deshacer última migración
npm run migrate:undo

# Cargar datos de ejemplo
npm run seed
```

### Verificación
```powershell
# Health check del backend
curl http://localhost:3000/health

# Diagnóstico de PostgreSQL
.\check-postgres.ps1
```

---

## 📁 Estructura del Proyecto

```
tusalon/
├── backend/                 # API REST con Node.js + Express
│   ├── config/             # Configuración de base de datos
│   ├── migrations/         # Migraciones de Sequelize
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API
│   ├── seeders/            # Datos de ejemplo
│   └── server.js           # Punto de entrada
├── frontend/               # Aplicación web (HTML/CSS/JS)
├── setup-tusalon.ps1       # Script de configuración automática
├── check-postgres.ps1      # Script de diagnóstico
└── README.md               # Este archivo
```

---

## 🔧 Solución de Problemas

### PostgreSQL no está instalado
```powershell
# Ejecutar diagnóstico
.\check-postgres.ps1
```

Ver guía completa: `postgresql_installation_guide.md`

### Error de conexión a la base de datos
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `backend\.env`
3. Crear la base de datos manualmente:
   ```powershell
   psql -U postgres -c "CREATE DATABASE tusalon_db;"
   ```

### Puerto 3000 ya está en uso
Cambiar el puerto en `backend\.env`:
```env
PORT=3001
```

---

## 📖 Documentación Completa

- **README original**: [./README-ORIGINAL.md](./README.md)
- **README del backend**: [backend/README.md](backend/README.md)
- **Guía de PostgreSQL**: `.gemini/antigravity/brain/postgresql_installation_guide.md`
- **Plan de implementación**: `.gemini/antigravity/brain/implementation_plan.md`
- **Walkthrough**: `.gemini/antigravity/brain/walkthrough.md`

---

## 🎯 Próximos Pasos

1. **Si PostgreSQL no está instalado**:
   - Instalar PostgreSQL (ver "Paso 2" arriba)
   - Ejecutar `.\setup-tusalon.ps1`

2. **Si PostgreSQL ya está instalado**:
   - Ejecutar `.\setup-tusalon.ps1`
   - El script hará todo automáticamente

3. **Iniciar desarrollo**:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npx http-server -p 8080 -o`

---

**¿Todo listo? Ejecuta `.\setup-tusalon.ps1` y comienza a usar TuSalon! 🎉**
