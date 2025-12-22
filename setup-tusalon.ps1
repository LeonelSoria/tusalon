# =============================================================================
# Script de Configuración Automática de TuSalon
# =============================================================================
# Este script configura y ejecuta el proyecto TuSalon completo
# Ejecutar desde la raíz del proyecto: .\setup-tusalon.ps1
# =============================================================================

Write-Host "🚀 TuSalon - Script de Configuración Automática" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Variables de configuración
$BackendPath = "backend"
$FrontendPath = "frontend"
$BackendPort = 3000
$FrontendPort = 8080

# =============================================================================
# 1. Verificar Prerrequisitos
# =============================================================================
Write-Host "📋 Paso 1: Verificando prerrequisitos..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "  Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "  ✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar PostgreSQL
$postgresInstalled = $false
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ PostgreSQL: $psqlVersion" -ForegroundColor Green
        $postgresInstalled = $true
    }
} catch {
    Write-Host "  ⚠️  PostgreSQL no está en el PATH" -ForegroundColor Yellow
}

if (-not $postgresInstalled) {
    Write-Host ""
    Write-Host "⚠️  PostgreSQL no está disponible" -ForegroundColor Yellow
    Write-Host "Por favor, instala PostgreSQL antes de continuar." -ForegroundColor Yellow
    Write-Host "Revisa el archivo: postgresql_installation_guide.md" -ForegroundColor Cyan
    Write-Host ""
    
    $continue = Read-Host "¿Quieres continuar de todas formas? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""

# =============================================================================
# 2. Verificar Archivo .env
# =============================================================================
Write-Host "📋 Paso 2: Verificando configuración..." -ForegroundColor Yellow

if (-not (Test-Path "$BackendPath\.env")) {
    Write-Host "  ⚠️  Archivo .env no encontrado, creándolo..." -ForegroundColor Yellow
    
    if (Test-Path "$BackendPath\.env.example") {
        Copy-Item "$BackendPath\.env.example" "$BackendPath\.env"
        Write-Host "  ✅ Archivo .env creado desde .env.example" -ForegroundColor Green
        Write-Host "  ⚠️  Por favor, edita backend\.env con tus credenciales de PostgreSQL" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ .env.example no encontrado" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✅ Archivo .env encontrado" -ForegroundColor Green
}

Write-Host ""

# =============================================================================
# 3. Instalar Dependencias del Backend
# =============================================================================
Write-Host "📋 Paso 3: Instalando dependencias del backend..." -ForegroundColor Yellow

Push-Location $BackendPath

if (-not (Test-Path "node_modules")) {
    Write-Host "  Ejecutando npm install..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error al instalar dependencias" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} else {
    Write-Host "  ✅ Dependencias ya instaladas" -ForegroundColor Green
}

Pop-Location
Write-Host ""

# =============================================================================
# 4. Verificar Conexión a la Base de Datos
# =============================================================================
if ($postgresInstalled) {
    Write-Host "📋 Paso 4: Verificando conexión a la base de datos..." -ForegroundColor Yellow
    
    Push-Location $BackendPath
    
    # Verificar conexión
    $dbTest = node -e "const { Sequelize } = require('sequelize'); const config = require('./config/database.js'); const seq = new Sequelize(config.development); seq.authenticate().then(() => { console.log('OK'); process.exit(0); }).catch(err => { console.error(err.message); process.exit(1); });" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Conexión a la base de datos exitosa" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  No se pudo conectar a la base de datos" -ForegroundColor Yellow
        Write-Host "  Error: $dbTest" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Asegúrate de que:" -ForegroundColor Yellow
        Write-Host "  1. PostgreSQL esté corriendo" -ForegroundColor Yellow
        Write-Host "  2. Las credenciales en .env sean correctas" -ForegroundColor Yellow
        Write-Host "  3. La base de datos 'tusalon_db' exista" -ForegroundColor Yellow
        Write-Host ""
        
        $createDb = Read-Host "¿Quieres intentar crear la base de datos? (y/N)"
        if ($createDb -eq "y" -or $createDb -eq "Y") {
            Write-Host "  Creando base de datos..." -ForegroundColor Cyan
            psql -U postgres -c "CREATE DATABASE tusalon_db;"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Base de datos creada" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  No se pudo crear la base de datos automáticamente" -ForegroundColor Yellow
                Write-Host "  Puedes crearla manualmente con: psql -U postgres -c 'CREATE DATABASE tusalon_db;'" -ForegroundColor Cyan
            }
        }
    }
    
    Pop-Location
    Write-Host ""
}

# =============================================================================
# 5. Ejecutar Migraciones
# =============================================================================
if ($postgresInstalled) {
    Write-Host "📋 Paso 5: Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
    
    Push-Location $BackendPath
    
    npm run migrate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Migraciones ejecutadas correctamente" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Error al ejecutar migraciones" -ForegroundColor Yellow
        Write-Host "  Verifica la conexión a la base de datos" -ForegroundColor Yellow
    }
    
    Pop-Location
    Write-Host ""
}

# =============================================================================
# 6. Cargar Datos de Ejemplo
# =============================================================================
if ($postgresInstalled) {
    Write-Host "📋 Paso 6: Cargando datos de ejemplo..." -ForegroundColor Yellow
    
    $loadSeeders = Read-Host "¿Quieres cargar datos de ejemplo (usuarios, salones, servicios)? (Y/n)"
    
    if ($loadSeeders -ne "n" -and $loadSeeders -ne "N") {
        Push-Location $BackendPath
        
        npm run seed
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Datos de ejemplo cargados correctamente" -ForegroundColor Green
            Write-Host ""
            Write-Host "  📧 Credenciales de prueba:" -ForegroundColor Cyan
            Write-Host "     Proveedor: proveedor1@tusalon.com / password123" -ForegroundColor White
            Write-Host "     Cliente:   cliente1@tusalon.com / password123" -ForegroundColor White
            Write-Host "     Admin:     admin@tusalon.com / password123" -ForegroundColor White
        } else {
            Write-Host "  ⚠️  Error al cargar datos de ejemplo" -ForegroundColor Yellow
        }
        
        Pop-Location
    } else {
        Write-Host "  ⏭️  Omitiendo datos de ejemplo" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# =============================================================================
# 7. Mostrar Resumen
# =============================================================================
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✅ Configuración completada" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Iniciar el backend:" -ForegroundColor White
Write-Host "   cd $BackendPath" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host "   🌐 Backend: http://localhost:$BackendPort" -ForegroundColor Gray
Write-Host ""
Write-Host "2. En otra terminal, iniciar el frontend:" -ForegroundColor White
Write-Host "   cd $FrontendPath" -ForegroundColor Cyan
Write-Host "   npx http-server -p $FrontendPort -o" -ForegroundColor Cyan
Write-Host "   🌐 Frontend: http://localhost:$FrontendPort" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verificar salud del backend:" -ForegroundColor White
Write-Host "   curl http://localhost:$BackendPort/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan

# Preguntar si quiere iniciar los servidores
Write-Host ""
$startServers = Read-Host "¿Quieres iniciar el servidor backend ahora? (Y/n)"

if ($startServers -ne "n" -and $startServers -ne "N") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Green
    Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location $BackendPath
    npm run dev
    Pop-Location
}
