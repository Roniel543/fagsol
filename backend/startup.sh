#!/bin/bash

echo "=========================================="
echo "Iniciando aplicación Django en Azure..."
echo "=========================================="

# Mostrar variables de entorno importantes (sin contraseñas)
echo "DB_HOST: ${DB_HOST:-NO_CONFIGURADO}"
echo "DB_NAME: ${DB_NAME:-NO_CONFIGURADO}"
echo "DB_USER: ${DB_USER:-NO_CONFIGURADO}"
echo "DEBUG: ${DEBUG:-NO_CONFIGURADO}"
echo "SECRET_KEY: ${SECRET_KEY:+CONFIGURADA}"
echo "ALLOWED_HOSTS: ${ALLOWED_HOSTS:-NO_CONFIGURADO}"

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

# Verificar que Django puede iniciar
echo ""
echo "=========================================="
echo "Verificando configuración de Django..."
echo "=========================================="
python manage.py check --deploy 2>&1 | head -30 || echo "⚠ Advertencias en check, pero continuando..."

# Verificar Gunicorn
echo ""
echo "Verificando Gunicorn..."
if command -v gunicorn &> /dev/null; then
    echo "✓ Gunicorn encontrado: $(which gunicorn)"
    gunicorn --version
else
    echo "✗ ERROR: Gunicorn no encontrado"
    exit 1
fi

# Iniciar Gunicorn
echo ""
echo "=========================================="
echo "Iniciando Gunicorn en puerto ${PORT:-8000}..."
echo "=========================================="
echo "Comando: gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"
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
