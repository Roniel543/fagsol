#!/bin/bash
set -e

echo "=========================================="
echo "Iniciando aplicación Django en Azure"
echo "=========================================="

# Cambiar al directorio de la aplicación
cd /home/site/wwwroot

# Mostrar variables de entorno importantes (sin mostrar contraseñas)
echo "Variables de entorno:"
echo "  - PORT: ${PORT:-no configurado}"
echo "  - WEBSITES_PORT: ${WEBSITES_PORT:-no configurado}"
echo "  - DB_HOST: ${DB_HOST:-no configurado}"
echo "  - DB_NAME: ${DB_NAME:-no configurado}"

# Activar entorno virtual (ya viene instalado desde el build)
if [ -d "antenv" ]; then
    echo "Activando entorno virtual existente..."
    source antenv/bin/activate
    echo "✓ Entorno virtual activado"
else
    echo "⚠ ADVERTENCIA: entorno virtual no encontrado, creándolo..."
    python3 -m venv antenv
    source antenv/bin/activate
    pip install --upgrade pip
    if [ -f "requirements.txt" ]; then
        echo "Instalando dependencias desde requirements.txt..."
        pip install --no-cache-dir -r requirements.txt
    fi
fi

# Verificar que Django está instalado
if ! python -c "import django" 2>/dev/null; then
    echo "⚠ ADVERTENCIA: Django no encontrado, instalando dependencias..."
    pip install --no-cache-dir -r requirements.txt
fi

# Función para esperar la base de datos
wait_for_db() {
    echo "Esperando a que la base de datos esté disponible..."
    echo "Host: ${DB_HOST:-no configurado}"
    echo "Database: ${DB_NAME:-no configurado}"
    echo "User: ${DB_USER:-no configurado}"
    ATTEMPTS=0
    MAX_ATTEMPTS=10
    DELAY=3

    until python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.db import connection
connection.ensure_connection()
" 2>&1 || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
        ERROR_OUTPUT=$(python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.db import connection
try:
    connection.ensure_connection()
except Exception as e:
    print(str(e))
" 2>&1 || echo "Error desconocido")
        echo "Intento $((ATTEMPTS+1))/$MAX_ATTEMPTS: Error de conexión: $ERROR_OUTPUT"
        ATTEMPTS=$((ATTEMPTS+1))
        sleep $DELAY
    done

    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
        echo "⚠ ERROR CRÍTICO: No se pudo conectar a la base de datos después de $MAX_ATTEMPTS intentos."
        echo "⚠ Verifica:"
        echo "  1. Firewall de PostgreSQL permite conexiones desde Azure Services"
        echo "  2. Variables de entorno DB_HOST, DB_NAME, DB_USER, DB_PASSWORD están correctas"
        echo "  3. La base de datos está en estado 'Ready'"
        echo "  4. El nombre de la base de datos existe en PostgreSQL"
        echo "⚠ Continuando sin conexión a BD (la app fallará)..."
    else
        echo "✓ Base de datos disponible."
    fi
}

wait_for_db

# Función para ejecutar migraciones con reintentos
migrate_db() {
    echo "Ejecutando migraciones..."
    ATTEMPTS=0
    MAX_ATTEMPTS=5
    DELAY=5

    until python manage.py migrate --noinput || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
        echo "Intento $((ATTEMPTS+1))/$MAX_ATTEMPTS: error en migraciones. Reintentando en $DELAY segundos..."
        ATTEMPTS=$((ATTEMPTS+1))
        sleep $DELAY
    done

    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
        echo "⚠ Las migraciones fallaron después de $MAX_ATTEMPTS intentos. Continuando..."
    else
        echo "✓ Migraciones aplicadas correctamente."
    fi
}

migrate_db

# Recolectar archivos estáticos
# NOTA: Django solo es API REST, los archivos estáticos son mínimos (Admin + Swagger)
# Por lo tanto, collectstatic debería ser rápido. Si tarda mucho, hay un problema.
echo "Recolectando archivos estáticos (Admin Django + Swagger UI)..."
echo "  (Esto debería ser rápido ya que Django solo es API REST)"

# Ejecutar collectstatic con timeout corto (solo Admin y Swagger, no debería tardar)
if command -v timeout >/dev/null 2>&1; then
    timeout 20 python manage.py collectstatic --noinput --clear 2>&1 | head -20 || {
        echo "⚠ Timeout o error en collectstatic (continuando de todas formas)"
        echo "  Los archivos estáticos se servirán desde WhiteNoise si están disponibles"
    }
else
    python manage.py collectstatic --noinput --clear 2>&1 | head -20 || {
        echo "⚠ Error en collectstatic (continuando de todas formas)"
    }
fi

echo "✓ Recolección de archivos estáticos completada (o omitida si hubo error)"

# Configurar puerto (Azure App Service configura PORT automáticamente)
# Azure puede usar PORT o WEBSITES_PORT
if [ -z "$PORT" ] && [ -n "$WEBSITES_PORT" ]; then
    PORT=$WEBSITES_PORT
elif [ -z "$PORT" ]; then
    PORT=8000
    echo "⚠ ADVERTENCIA: PORT no configurado, usando puerto por defecto 8000"
fi

# Asegurar que PORT es un número
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "⚠ ERROR: PORT no es un número válido: $PORT, usando 8000"
    PORT=8000
fi

echo "=========================================="
echo "Configuración final:"
echo "  - Puerto: $PORT"
echo "  - Workers: 2"
echo "  - Timeout: 180"
echo "=========================================="
echo "Iniciando Gunicorn en puerto $PORT"
echo "=========================================="

# Asegurar que estamos en el directorio correcto
cd /home/site/wwwroot

# Verificar que Gunicorn está instalado
if ! python -c "import gunicorn" 2>/dev/null; then
    echo "⚠ ERROR: Gunicorn no está instalado. Instalando..."
    pip install gunicorn
fi

# Iniciar Gunicorn (exec reemplaza el proceso actual)
# IMPORTANTE: exec hace que Gunicorn reemplace el proceso del script
echo "Ejecutando: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 180"
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --timeout 180 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output \
    --preload
