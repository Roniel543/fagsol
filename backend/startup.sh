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
    # ESTRATEGIA: Siempre verificar y reinstalar cryptography si es necesario
    if [ -d "antenv" ]; then
        echo "⚠ Entorno virtual existente detectado"
        echo "  Verificando compatibilidad de cryptography..."
        source antenv/bin/activate
        
        # Intentar importar cryptography para detectar problemas de GLIBC
        CRYPTO_ERROR=$(python -c "import cryptography" 2>&1 || echo "ERROR")
        if echo "$CRYPTO_ERROR" | grep -q "GLIBC"; then
            echo "⚠ ERROR DETECTADO: cryptography tiene problemas de compatibilidad GLIBC"
            echo "  Reinstalando cryptography para el entorno correcto de Azure..."
            pip uninstall -y cryptography || true
            pip install --upgrade pip
            # Reinstalar cryptography (se compilará para el entorno de Azure)
            pip install --no-cache-dir --force-reinstall cryptography || {
                echo "⚠ Falló reinstalación de cryptography, intentando sin cache..."
                pip install --no-cache-dir --no-binary cryptography cryptography
            }
            
            # Verificar nuevamente
            if python -c "import cryptography" 2>&1 | grep -q "GLIBC"; then
                echo "✗ ERROR CRÍTICO: cryptography aún tiene problemas después de reinstalación"
                echo "  Eliminando entorno virtual completo para recrearlo..."
                deactivate
                rm -rf antenv
                echo "✓ Entorno virtual eliminado, se recreará a continuación"
            else
                echo "✓ cryptography reinstalado correctamente"
            fi
        else
            echo "✓ cryptography funciona correctamente"
        fi
    fi
    
    # Crear entorno virtual si no existe
    if [ ! -d "antenv" ]; then
        echo "Creando entorno virtual e instalando dependencias..."
        python3 -m venv antenv
        source antenv/bin/activate
        pip install --upgrade pip
        
        if [ -f "requirements.txt" ]; then
            echo "Instalando dependencias desde requirements.txt..."
            echo "  (Esto puede tardar varios minutos - las dependencias se compilarán para Azure)"
            # Instalar dependencias normalmente (Azure compilará para su entorno)
            pip install --no-cache-dir -r requirements.txt
            
            # Verificar que cryptography se instaló correctamente
            echo "Verificando instalación de cryptography..."
            if python -c "import cryptography" 2>&1 | grep -q "GLIBC"; then
                echo "⚠ ERROR: cryptography tiene problemas de GLIBC después de instalación"
                echo "  Intentando reinstalar cryptography específicamente..."
                pip uninstall -y cryptography || true
                pip install --no-cache-dir --no-binary cryptography cryptography || {
                    echo "✗ ERROR: No se pudo instalar cryptography compatible"
                    echo "  La aplicación puede fallar al usar JWT tokens"
                }
            else
                echo "✓ cryptography instalado y verificado correctamente"
            fi
        fi
    else
        # Si antenv existe y pasó la verificación, solo activar
        if [ -z "$VIRTUAL_ENV" ]; then
            echo "Activando entorno virtual existente..."
            source antenv/bin/activate
        fi
        
        # Verificar que Django está instalado
        if ! python -c "import django" 2>/dev/null; then
            echo "⚠ Django no encontrado, instalando dependencias..."
            pip install --upgrade pip
            pip install --no-cache-dir -r requirements.txt
        fi
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
