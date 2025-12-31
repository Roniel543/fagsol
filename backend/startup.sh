#!/bin/bash

echo "=========================================="
echo "Iniciando aplicación Django en Azure..."
echo "=========================================="

echo "DB_HOST: ${DB_HOST:-NO_CONFIGURADO}"
echo "DB_NAME: ${DB_NAME:-NO_CONFIGURADO}"
echo "DB_USER: ${DB_USER:-NO_CONFIGURADO}"
echo "DEBUG: ${DEBUG:-NO_CONFIGURADO}"
echo "SECRET_KEY: ${SECRET_KEY:+CONFIGURADA}"
echo "ALLOWED_HOSTS: ${ALLOWED_HOSTS:-NO_CONFIGURADO}"

echo ""
echo "=========================================="
echo "Aplicando migraciones..."
echo "=========================================="
python manage.py migrate --noinput || exit 1

echo ""
echo "=========================================="
echo "Recolectando archivos estáticos..."
echo "=========================================="
python manage.py collectstatic --noinput || true

echo ""
echo "=========================================="
echo "Verificando Gunicorn..."
echo "=========================================="
gunicorn --version || exit 1

echo ""
echo "=========================================="
echo "Iniciando Gunicorn en puerto $PORT"
echo "=========================================="
echo "PORT usado por Azure: $PORT"
echo ""

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --timeout 180 \
    --access-logfile - \
    --error-logfile - \
    --log-level debug
