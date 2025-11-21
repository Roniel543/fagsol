# Dockerfile para Django Backend - FagSol Escuela Virtual

FROM python:3.11-slim

# Metadatos
LABEL maintainer="FagSol Development Team"
LABEL description="Django Backend para FagSol Escuela Virtual"

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    libpq-dev \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar cache de Docker)
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs staticfiles media instructor_applications/cv

# Crear script para esperar a la base de datos
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
host="$1"\n\
shift\n\
cmd="$@"\n\
\n\
until PGPASSWORD=$DB_PASSWORD psql -h "$host" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; do\n\
  >&2 echo "PostgreSQL no está disponible - esperando..."\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "PostgreSQL está disponible - ejecutando comando"\n\
exec $cmd' > /usr/local/bin/wait-for-postgres.sh && \
    chmod +x /usr/local/bin/wait-for-postgres.sh

# Crear script de gestión para wait_for_db
RUN echo 'import sys\n\
import time\n\
import psycopg2\n\
from django.conf import settings\n\
\n\
def wait_for_db():\n\
    """Espera a que la base de datos esté disponible"""\n\
    max_attempts = 30\n\
    attempt = 0\n\
    \n\
    while attempt < max_attempts:\n\
        try:\n\
            conn = psycopg2.connect(\n\
                host=settings.DATABASES["default"]["HOST"],\n\
                database=settings.DATABASES["default"]["NAME"],\n\
                user=settings.DATABASES["default"]["USER"],\n\
                password=settings.DATABASES["default"]["PASSWORD"],\n\
                port=settings.DATABASES["default"]["PORT"]\n\
            )\n\
            conn.close()\n\
            print("✓ Base de datos disponible")\n\
            return True\n\
        except psycopg2.OperationalError:\n\
            attempt += 1\n\
            print(f"Esperando base de datos... ({attempt}/{max_attempts})")\n\
            time.sleep(2)\n\
    \n\
    print("✗ No se pudo conectar a la base de datos")\n\
    sys.exit(1)\n\
\n\
if __name__ == "__main__":\n\
    import django\n\
    django.setup()\n\
    wait_for_db()' > wait_for_db.py

# Exponer puerto
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/auth/health/ || exit 1

# Comando por defecto (puede ser sobreescrito en docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
