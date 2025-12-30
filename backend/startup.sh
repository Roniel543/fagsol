#!/bin/bash

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
if python manage.py migrate --noinput; then
    echo "✓ Migraciones aplicadas correctamente"
else
    echo "✗ ERROR: Las migraciones fallaron"
    exit 1
fi

# Recolectar archivos estáticos (no crítico si falla)
echo ""
echo "=========================================="
echo "Recolectando archivos estáticos..."
echo "=========================================="
if python manage.py collectstatic --noinput; then
    echo "✓ Archivos estáticos recolectados correctamente"
else
    echo "⚠ ADVERTENCIA: collectstatic falló, pero continuando..."
fi

# Iniciar Gunicorn
echo ""
echo "=========================================="
echo "Iniciando Gunicorn..."
echo "=========================================="
echo "Comando: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120"
echo ""

# Usar exec para reemplazar el proceso actual con Gunicorn
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output \
    --enable-stdio-inheritance