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

    # Crear/activar entorno virtual e instalar dependencias
    # IMPORTANTE: Instalamos aquí para evitar problemas de compatibilidad GLIBC
    # (cryptography compilado en GitHub Actions puede no ser compatible con Azure)
    # ESTRATEGIA: Si antenv existe, activarlo y verificar si tiene dependencias
    # Si faltan dependencias, instalarlas (puede ser que el entorno esté vacío)
    if [ -d "antenv" ]; then
        echo "✓ Entorno virtual existente detectado"
        echo "  Activando y verificando dependencias..."
        source antenv/bin/activate
        echo "✓ Entorno virtual activado" 
        
        # Verificar si Django está instalado (verificación rápida)
        if ! python -c "import django" 2>/dev/null; then
            echo "⚠ Django no encontrado en el entorno virtual"
            echo "  Instalando dependencias desde requirements.txt..."
            echo "  (Esto puede tardar 10-15 minutos - por favor espere)"
            pip install --upgrade pip
            if [ -f "requirements.txt" ]; then
                # Instalar con output en tiempo real para que Azure vea progreso
                echo "  [$(date +%H:%M:%S)] Iniciando instalación de dependencias..."
                pip install --no-cache-dir -r requirements.txt || {
                    echo "⚠ ERROR durante instalación, reintentando..."
                    pip install --no-cache-dir -r requirements.txt || {
                        echo "✗ ERROR CRÍTICO: No se pudieron instalar las dependencias"
                        exit 1
                    }
                }
                echo "  [$(date +%H:%M:%S)] ✓ Dependencias instaladas"
            else
                echo "✗ ERROR: requirements.txt no encontrado"
            fi
        else
            echo "✓ Django encontrado, dependencias OK"
        fi
    else
        # Crear entorno virtual si no existe
        echo "Creando entorno virtual e instalando dependencias..."
        echo "  (Esto puede tardar varios minutos - las dependencias se compilarán para Azure)"
        python3 -m venv antenv
        source antenv/bin/activate
        pip install --upgrade pip
        
        if [ -f "requirements.txt" ]; then
            echo "Instalando dependencias desde requirements.txt..."
            echo "  (Esto puede tardar 10-15 minutos - por favor espere)"
            # Instalar dependencias normalmente (Azure compilará para su entorno)
            # Usar timeout y logging para evitar que se cuelgue
            pip install --no-cache-dir -r requirements.txt 2>&1 | tee /tmp/pip_install.log || {
                echo "⚠ ERROR durante instalación, revisando logs..."
                tail -50 /tmp/pip_install.log || true
                echo "  Reintentando instalación..."
                pip install --no-cache-dir -r requirements.txt || {
                    echo "✗ ERROR CRÍTICO: No se pudieron instalar las dependencias"
                    exit 1
                }
            }
            echo "✓ Dependencias instaladas"
        else
            echo "✗ ERROR: requirements.txt no encontrado"
        fi
    fi
    
    # Asegurar que el entorno virtual está activado
    if [ -z "$VIRTUAL_ENV" ] && [ -d "antenv" ]; then
        source antenv/bin/activate
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

# Verificar archivos estáticos
# NOTA: collectstatic ya se ejecutó durante el BUILD en GitHub Actions
# Solo verificamos que existan, NO los regeneramos (evita timeout)
echo "=========================================="
echo "Verificando archivos estáticos..."
echo "  (Ya fueron generados durante el build)"
echo "=========================================="

# Verificar que el directorio staticfiles existe
if [ ! -d "staticfiles" ]; then
    echo "⚠ ADVERTENCIA: staticfiles no existe, creándolo..."
    mkdir -p staticfiles
fi

# Verificar que el manifest.json existe (crítico para CompressedManifestStaticFilesStorage)
if [ -f "staticfiles/staticfiles.json" ] || [ -f "staticfiles/manifest.json" ]; then
    echo "✓ Manifest de archivos estáticos encontrado"
    ls -lh staticfiles/*.json 2>/dev/null | head -3 || echo "  (manifest en otro formato)"
    
    # Mostrar resumen de archivos estáticos
    echo "✓ Resumen de archivos estáticos:"
    du -sh staticfiles/ 2>/dev/null || echo "  (no se pudo calcular tamaño)"
    FILE_COUNT=$(find staticfiles -type f 2>/dev/null | wc -l)
    echo "  Archivos totales: $FILE_COUNT"
    
    if [ "$FILE_COUNT" -eq 0 ]; then
        echo "⚠ ADVERTENCIA: staticfiles está vacío"
        echo "  Ejecutando collectstatic (sin --clear para ser más rápido)..."
        timeout 30 python manage.py collectstatic --noinput 2>&1 | tail -20 || {
            echo "⚠ collectstatic falló o timeout, pero continuando..."
        }
    fi
else
    echo "⚠ ADVERTENCIA: manifest.json no encontrado"
    echo "  Esto puede causar errores 500 en el admin de Django"
    echo "  Ejecutando collectstatic (sin --clear para ser más rápido)..."
    timeout 30 python manage.py collectstatic --noinput 2>&1 | tail -20 || {
        echo "✗ ERROR: collectstatic falló o timeout"
        echo "  El admin de Django puede no funcionar correctamente"
        echo "  Verificando contenido de staticfiles:"
        ls -la staticfiles/ | head -10
    }
fi

echo "=========================================="

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
