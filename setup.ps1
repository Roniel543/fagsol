# Script de inicialización para FagSol Escuela Virtual (Windows PowerShell)
# Este script configura el proyecto para desarrollo con Docker

Write-Host "🚀 Configurando FagSol Escuela Virtual..." -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker no está instalado. Por favor instala Docker Desktop." -ForegroundColor Red
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose encontrado: $composeVersion" -ForegroundColor Green
} catch {
    try {
        docker compose version | Out-Null
        Write-Host "✓ Docker Compose encontrado (v2)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Docker Compose no está instalado." -ForegroundColor Red
        exit 1
    }
}

# Crear .env si no existe
if (-not (Test-Path .env)) {
    Write-Host "⚠ Archivo .env no encontrado. Creando desde .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✓ Archivo .env creado" -ForegroundColor Green
        Write-Host "⚠ Por favor, revisa y ajusta las variables en .env si es necesario" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Archivo .env.example no encontrado" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Archivo .env ya existe" -ForegroundColor Green
}

# Construir imágenes
Write-Host ""
Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Cyan
docker-compose build

# Levantar servicios
Write-Host ""
Write-Host "🚀 Levantando servicios..." -ForegroundColor Cyan
docker-compose up -d

# Esperar a que la base de datos esté lista
Write-Host ""
Write-Host "⏳ Esperando a que la base de datos esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Aplicar migraciones
Write-Host ""
Write-Host "📦 Aplicando migraciones..." -ForegroundColor Cyan
docker-compose exec -T backend python manage.py migrate

# Recolectar archivos estáticos
Write-Host ""
Write-Host "📁 Recolectando archivos estáticos..." -ForegroundColor Cyan
docker-compose exec -T backend python manage.py collectstatic --noinput

# Mostrar estado
Write-Host ""
Write-Host "📊 Estado de los servicios:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost:3000"
Write-Host "   Backend API: http://localhost:8000"
Write-Host "   Swagger:     http://localhost:8000/swagger/"
Write-Host "   Admin:       http://localhost:8000/admin/"
Write-Host ""
Write-Host "📝 Ver logs con: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 Detener con: docker-compose down" -ForegroundColor Yellow
Write-Host ""
Write-Host "👤 Para crear superusuario:" -ForegroundColor Yellow
Write-Host "   docker-compose exec backend python manage.py createsuperuser" -ForegroundColor Green
Write-Host ""

