#!/bin/bash
set -e

echo "=========================================="
echo "Iniciando aplicación Django en Azure"
echo "=========================================="

# Cambiar al directorio de la aplicación
cd /home/site/wwwroot

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
    ATTEMPTS=0
    MAX_ATTEMPTS=30
    DELAY=2

    until python manage.py dbshell >/dev/null 2>&1 || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
        echo "Intento $((ATTEMPTS+1))/$MAX_ATTEMPTS: base de datos no disponible. Esperando $DELAY segundos..."
        ATTEMPTS=$((ATTEMPTS+1))
        sleep $DELAY
    done

    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
        echo "⚠ No se pudo conectar a la base de datos después de $MAX_ATTEMPTS intentos. Continuando..."
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
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput || echo "⚠ Error al recolectar archivos estáticos, pero continuando..."

# Configurar puerto
PORT=${PORT:-8000}

echo "=========================================="
echo "Iniciando Gunicorn en puerto $PORT"
echo "=========================================="

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --timeout 180 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
