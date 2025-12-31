#!/bin/bash
set -e

echo "=========================================="
echo "Iniciando aplicación Django en Azure"
echo "=========================================="

# Cambiar al directorio de la aplicación
cd /home/site/wwwroot

# Crear entorno virtual si no existe
if [ ! -d "antenv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv antenv
fi

# Activar entorno virtual
echo "Activando entorno virtual..."
source antenv/bin/activate

# Actualizar pip
echo "Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
echo "Instalando dependencias desde requirements.txt..."
pip install --no-cache-dir -r requirements.txt

# Esperar a que la base de datos esté disponible
echo "Esperando a que la base de datos esté disponible..."
python manage.py wait_for_db --max-attempts=30 --delay=2 || {
    echo "⚠ No se pudo conectar a la base de datos, pero continuando..."
}

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py migrate --noinput || {
    echo "⚠ Error en migraciones, pero continuando..."
}

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput || {
    echo "⚠ Error al recolectar archivos estáticos, pero continuando..."
}

# Obtener el puerto desde la variable de entorno (Azure lo configura automáticamente)
PORT=${PORT:-8000}

echo "=========================================="
echo "Iniciando Gunicorn en puerto $PORT"
echo "=========================================="

# Iniciar Gunicorn
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --timeout 180 \
    --access-logfile - \
    --error-logfile - \
    --log-level info

