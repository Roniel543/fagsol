#!/bin/bash
set -e

echo "=========================================="
echo "Iniciando aplicación Django en Azure..."
echo "=========================================="

# Mostrar variables de entorno importantes (sin contraseñas)
echo "DB_HOST: ${DB_HOST:-NO_CONFIGURADO}"
echo "DB_NAME: ${DB_NAME:-NO_CONFIGURADO}"
echo "DB_USER: ${DB_USER:-NO_CONFIGURADO}"
echo "DEBUG: ${DEBUG:-NO_CONFIGURADO}"

# Aplicar migraciones
echo ""
echo "=========================================="
echo "Aplicando migraciones..."
echo "=========================================="
python manage.py migrate --noinput || {
    echo "ERROR: Las migraciones fallaron"
    exit 1
}

# Recolectar archivos estáticos (no crítico si falla)
echo ""
echo "=========================================="
echo "Recolectando archivos estáticos..."
echo "=========================================="
python manage.py collectstatic --noinput || {
    echo "ADVERTENCIA: collectstatic falló, pero continuando..."
}

# Iniciar Gunicorn
echo ""
echo "=========================================="
echo "Iniciando Gunicorn..."
echo "=========================================="
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output

