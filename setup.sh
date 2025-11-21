#!/bin/bash

# Script de inicialización para FagSol Escuela Virtual
# Este script configura el proyecto para desarrollo con Docker

set -e

echo "🚀 Configurando FagSol Escuela Virtual..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker no está instalado. Por favor instala Docker Desktop.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose no está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker encontrado${NC}"

# Crear .env si no existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ Archivo .env no encontrado. Creando desde .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Archivo .env creado${NC}"
        echo -e "${YELLOW}⚠ Por favor, revisa y ajusta las variables en .env si es necesario${NC}"
    else
        echo -e "${RED}✗ Archivo .env.example no encontrado${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
fi

# Construir imágenes
echo ""
echo "🔨 Construyendo imágenes Docker..."
docker-compose build

# Levantar servicios
echo ""
echo "🚀 Levantando servicios..."
docker-compose up -d

# Esperar a que la base de datos esté lista
echo ""
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Aplicar migraciones
echo ""
echo "📦 Aplicando migraciones..."
docker-compose exec -T backend python manage.py migrate || echo "⚠ Error en migraciones, intentando de nuevo..."
sleep 5
docker-compose exec -T backend python manage.py migrate

# Recolectar archivos estáticos
echo ""
echo "📁 Recolectando archivos estáticos..."
docker-compose exec -T backend python manage.py collectstatic --noinput || echo "⚠ Algunos archivos estáticos no se pudieron recolectar"

# Verificar si existe superusuario
echo ""
echo "👤 Verificando superusuario..."
SUPERUSER_EXISTS=$(docker-compose exec -T backend python manage.py shell -c "from django.contrib.auth.models import User; print('True' if User.objects.filter(is_superuser=True).exists() else 'False')" 2>/dev/null || echo "False")

if [ "$SUPERUSER_EXISTS" != "True" ]; then
    echo -e "${YELLOW}⚠ No se encontró superusuario.${NC}"
    echo -e "${YELLOW}Por favor, crea uno ejecutando:${NC}"
    echo -e "${GREEN}docker-compose exec backend python manage.py createsuperuser${NC}"
else
    echo -e "${GREEN}✓ Superusuario encontrado${NC}"
fi

# Mostrar estado
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Swagger:     http://localhost:8000/swagger/"
echo "   Admin:       http://localhost:8000/admin/"
echo ""
echo "📝 Ver logs con: docker-compose logs -f"
echo "🛑 Detener con: docker-compose down"
echo ""

