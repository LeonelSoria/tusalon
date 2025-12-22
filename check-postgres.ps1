# Script rapido para verificar el estado de PostgreSQL
# Ejecutar: .\check-postgres.ps1

Write-Host "Verificando PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Verificar comando psql
Write-Host "1. Verificando comando psql..." -ForegroundColor Yellow
try {
    $version = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Encontrado: $version" -ForegroundColor Green
    }
    else {
        Write-Host "   psql no disponible en el PATH" -ForegroundColor Red
    }
}
catch {
    Write-Host "   psql no disponible" -ForegroundColor Red
}

Write-Host ""

# Buscar instalaciones de PostgreSQL
Write-Host "2. Buscando instalaciones de PostgreSQL..." -ForegroundColor Yellow

$commonPaths = @(
    "C:\Program Files\PostgreSQL",
    "C:\PostgreSQL",
    "C:\Program Files (x86)\PostgreSQL"
)

$found = $false
foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "   Encontrado en: $path" -ForegroundColor Green
        
        $versions = Get-ChildItem $path -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
        foreach ($ver in $versions) {
            Write-Host "      Version: $ver" -ForegroundColor Cyan
            
            $binPath = Join-Path $path $ver "bin"
            if (Test-Path $binPath) {
                Write-Host "         Binarios en: $binPath" -ForegroundColor Gray
                
                $psqlPath = Join-Path $binPath "psql.exe"
                if (Test-Path $psqlPath) {
                    Write-Host "         psql.exe encontrado" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "         Para agregar al PATH ejecuta:" -ForegroundColor Yellow
                    Write-Host "         [Environment]::SetEnvironmentVariable('Path', `$env:Path + ';$binPath', 'Machine')" -ForegroundColor Cyan
                }
            }
        }
        
        $found = $true
    }
}

if (-not $found) {
    Write-Host "   No se encontraron instalaciones en ubicaciones comunes" -ForegroundColor Red
}

Write-Host ""

# Verificar servicios de PostgreSQL
Write-Host "3. Verificando servicios de PostgreSQL..." -ForegroundColor Yellow

$services = Get-Service -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like "*postgres*" }

if ($services) {
    foreach ($service in $services) {
        $statusColor = if ($service.Status -eq "Running") { "Green" } else { "Yellow" }
        Write-Host "   Servicio: $($service.DisplayName)" -ForegroundColor Cyan
        Write-Host "      Estado: $($service.Status)" -ForegroundColor $statusColor
        Write-Host "      Nombre: $($service.ServiceName)" -ForegroundColor Gray
        
        if ($service.Status -ne "Running") {
            Write-Host "      Para iniciar: net start $($service.ServiceName)" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "   No se encontraron servicios de PostgreSQL" -ForegroundColor Red
}

Write-Host ""

# Verificar conexion desde Node.js
Write-Host "4. Verificando conexion desde el proyecto..." -ForegroundColor Yellow

if (Test-Path "backend\config\database.js") {
    Push-Location backend
    
    if (Test-Path "node_modules") {
        Write-Host "   Intentando conectar a la base de datos..." -ForegroundColor Cyan
        
        $testScript = "const {Sequelize} = require('sequelize'); const config = require('./config/database.js'); const seq = new Sequelize(config.development); seq.authenticate().then(() => {console.log('OK'); process.exit(0);}).catch(err => {console.log('ERROR:', err.message); process.exit(1);});"
        
        $result = node -e $testScript 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Conexion exitosa" -ForegroundColor Green
        }
        else {
            Write-Host "   Error de conexion: $result" -ForegroundColor Red
        }
    }
    else {
        Write-Host "   Dependencias no instaladas. Ejecuta: npm install" -ForegroundColor Yellow
    }
    
    Pop-Location
}
else {
    Write-Host "   Archivo de configuracion no encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan

# Recomendaciones
Write-Host ""
Write-Host "Recomendaciones:" -ForegroundColor Yellow
Write-Host ""

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "PostgreSQL no esta en el PATH del sistema" -ForegroundColor Yellow
    Write-Host "   Opciones:" -ForegroundColor Cyan
    Write-Host "   1. Instalar PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   2. Agregar PostgreSQL existente al PATH" -ForegroundColor White
    Write-Host "   3. Usar Docker: docker run --name tusalon-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16" -ForegroundColor White
}
else {
    Write-Host "PostgreSQL esta configurado correctamente" -ForegroundColor Green
}

Write-Host ""
