# Script de inicio automático para FagSol
# Ejecuta este script cuando tengas Docker Desktop corriendo

Write-Host "🚀 Iniciando FagSol Escuela Virtual..." -ForegroundColor Green
Write-Host ""

# Verificar que Docker esté corriendo
Write-Host "1️⃣  Verificando Docker..." -ForegroundColor Cyan
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop primero." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Verificar que existe el archivo .env
Write-Host "2️⃣  Verificando archivo .env..." -ForegroundColor Cyan
if (-not (Test-Path .env)) {
    Write-Host "❌ No se encontró el archivo .env" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Levantar servicios
Write-Host "3️⃣  Levantando servicios Docker..." -ForegroundColor Cyan
docker-compose up -d --build
Write-Host "✅ Servicios levantados" -ForegroundColor Green
Write-Host ""

# Esperar a que PostgreSQL esté listo
Write-Host "4️⃣  Esperando a que PostgreSQL esté listo..." -ForegroundColor Cyan
Write-Host "   (Esto puede tomar 30 segundos)" -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host "✅ PostgreSQL listo" -ForegroundColor Green
Write-Host ""

# Ejecutar migraciones
Write-Host "5️⃣  Ejecutando migraciones de base de datos..." -ForegroundColor Cyan
docker-compose exec -T backend python manage.py migrate
Write-Host "✅ Migraciones completadas" -ForegroundColor Green
Write-Host ""

# Instrucciones para crear superusuario
Write-Host "6️⃣  Crear superusuario (administrador)" -ForegroundColor Cyan
Write-Host "   Ejecuta el siguiente comando para crear tu usuario admin:" -ForegroundColor Yellow
Write-Host "   docker-compose exec backend python manage.py createsuperuser" -ForegroundColor White
Write-Host ""

# Mostrar estado
Write-Host "7️⃣  Estado de los servicios:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Mostrar URLs
Write-Host "✨ ¡FagSol está corriendo!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000/api" -ForegroundColor White
Write-Host "   Admin:     http://localhost:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Detener:         docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar:       docker-compose restart" -ForegroundColor White
Write-Host ""
Write-Host "🎓 Para crear superusuario, ejecuta:" -ForegroundColor Yellow
Write-Host "   docker-compose exec backend python manage.py createsuperuser" -ForegroundColor White
Write-Host ""

