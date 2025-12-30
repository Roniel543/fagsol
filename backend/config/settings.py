"""
Django settings for FagSol Escuela Virtual project.
"""

import os
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # Token blacklist
    'corsheaders',
    'axes',  # Rate limiting y lockouts
    'drf_yasg',  # OpenAPI/Swagger
    
    # Django Apps (Models & Admin)
    'apps.core',
    'apps.users',
    'apps.courses',
    'apps.payments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  #  WhiteNoise para servir archivos estáticos en producción
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware debe ir antes de CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'axes.middleware.AxesMiddleware',  # Rate limiting - debe ir después de AuthenticationMiddleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# Si DB_HOST no está configurado, usar 'localhost' para desarrollo local
DB_HOST = config('DB_HOST', default='localhost')
# Si el host es 'db' (Docker) pero no está disponible, usar localhost
if DB_HOST == 'db':
    try:
        import socket
        socket.gethostbyname('db')
    except socket.gaierror:
        # Si 'db' no se puede resolver, usar localhost
        DB_HOST = 'localhost'

# Configuración de base de datos con SSL para Azure PostgreSQL
DB_OPTIONS = {
    'client_encoding': 'UTF8',
    'connect_timeout': 10,
}

# Si estamos en Azure (detectado por el host), forzar SSL
if 'database.azure.com' in DB_HOST:
    DB_OPTIONS['sslmode'] = 'require'

DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.postgresql'),
        'NAME': config('DB_NAME', default='fagsol_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': DB_HOST,
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': DB_OPTIONS,
        'CONN_MAX_AGE': 500,
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Use Argon2 for password hashing (más seguro que bcrypt)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# Internationalization
LANGUAGE_CODE = 'es-pe'
TIME_ZONE = 'America/Lima'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Directorio donde se recolectan archivos estáticos para producción

#  WhiteNoise para servir archivos estáticos comprimidos en producción
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================================
# CUSTOM USER MODEL
# ==================================

AUTH_USER_MODEL = 'auth.User'  # Usamos Django User default con UserProfile

# ==================================
# REST FRAMEWORK CONFIGURATION
# ==================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'infrastructure.authentication.cookie_jwt_authentication.CookieJWTAuthentication',  # Cookies HTTP-Only (prioridad)
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Fallback para compatibilidad
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}

# ==================================
# JWT CONFIGURATION
# ==================================

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# ==================================
# CORS CONFIGURATION
# ==================================

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-idempotency-key',  # Para idempotency en pagos
    'x-request-id',  # Para logging/auditoría
]

# ==================================
# MEDIA FILES CONFIGURATION
# ==================================

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ==================================
# FRONTEND URL CONFIGURATION todo lo jala del ENV
# ==================================

FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# ==================================
# EMAIL CONFIGURATION
# ==================================

# Para desarrollo: usar backend de consola (emails se muestran en terminal)
# Para producción: configurar SMTP real
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend'
)

# Configuración SMTP (solo necesario en producción)
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@fagsol.edu.pe')

# ==================================
# SECURITY HEADERS
# ==================================

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0  # 1 año en producción
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Solo en producción
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# ==================================
# CSRF CONFIGURATION
# ==================================

# Configuración CSRF para cookies HTTP-Only
# SameSite=Strict ya proporciona protección CSRF básica
# Django REST Framework exime automáticamente las vistas API de CSRF cuando usan autenticación por token
# Sin embargo, con cookies HTTP-Only, mantenemos la protección CSRF activa

CSRF_COOKIE_HTTPONLY = False  # CSRF token debe ser accesible desde JavaScript para APIs
# CSRF_COOKIE_SECURE ya está configurado arriba en el bloque if not DEBUG
CSRF_COOKIE_SAMESITE = 'Strict'  # Protección CSRF adicional
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Django REST Framework exime automáticamente de CSRF cuando se usa autenticación por token
# Pero con cookies HTTP-Only, necesitamos asegurar que funcione correctamente
# DRF ya maneja esto automáticamente para vistas API con autenticación

# ==================================
# COOKIE CONFIGURATION (HTTP-Only JWT)
# ==================================

# Configuración de cookies para autenticación JWT
COOKIE_ACCESS_TOKEN_NAME = 'access_token'
COOKIE_REFRESH_TOKEN_NAME = 'refresh_token'

# Tiempo de vida de cookies (en segundos)
COOKIE_ACCESS_TOKEN_MAX_AGE = 60 * 60  # 1 hora (igual que ACCESS_TOKEN_LIFETIME)
COOKIE_REFRESH_TOKEN_MAX_AGE = 24 * 60 * 60  # 1 día (igual que REFRESH_TOKEN_LIFETIME)

# Configuración de seguridad de cookies
COOKIE_HTTPONLY = True  # No accesible desde JavaScript (protección XSS)
COOKIE_SECURE = not DEBUG  # Solo HTTPS en producción
COOKIE_SAMESITE = 'Strict'  # Protección CSRF

# ==================================
# RATE LIMITING (Axes) - SEGURIDAD PARA PRODUCCIÓN
# ==================================

AXES_ENABLED = True

# Configuración IDÉNTICA para desarrollo y producción
# 5 intentos fallidos en ambos entornos para consistencia
AXES_FAILURE_LIMIT = 5  # 5 intentos fallidos (estándar para apps con pagos)

# Tiempo de bloqueo según ambiente
if DEBUG:
    AXES_COOLOFF_TIME = 0.5  # 30 minutos de bloqueo en desarrollo
else:
    AXES_COOLOFF_TIME = 1  # 1 hora de bloqueo en producción

AXES_LOCKOUT_TEMPLATE = None
AXES_LOCKOUT_URL = None
AXES_RESET_ON_SUCCESS = True  # Resetear contador al hacer login exitoso
AXES_IP_WHITELIST = []

# Configuración de bloqueo: Por USUARIO específico, NO por IP
# IMPORTANTE: Estas configuraciones deben estar en este orden específico
# para que AXES las interprete correctamente
AXES_LOCKOUT_BY_COMBINATION_USER_AND_IP = False  # No bloquear por combinación usuario+IP
AXES_LOCKOUT_BY_USER_OR_IP = False  # No bloquear por usuario O IP (evita bloqueos globales)
AXES_LOCKOUT_BY_IP = False  # NO bloquear por IP (debe ir ANTES de LOCKOUT_BY_USER)
AXES_LOCKOUT_BY_USER = True  # Bloquear SOLO por usuario específico (debe ir DESPUÉS)

# Configuraciones adicionales para seguridad
AXES_LOCKOUT_CALLABLE = None  # Sin callback personalizado de bloqueo
AXES_VERBOSE = not DEBUG  # Logs detallados solo en producción
AXES_DISABLE_ACCESS_LOG = False  # Mantener logs de acceso
AXES_ENABLE_ACCESS_FAILURE_LOG = True  # Log de fallos de acceso
AXES_ACCESS_FAILURE_LOG_PER_USER_LIMIT = 100  # Límite de logs por usuario

# Authentication backends (incluir Axes)
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',  # Axes debe ir primero
    'django.contrib.auth.backends.ModelBackend',
]

# ==================================
# MERCADOPAGO CONFIGURATION
# ==================================

MERCADOPAGO_ACCESS_TOKEN = config('MERCADOPAGO_ACCESS_TOKEN', default='')
MERCADOPAGO_WEBHOOK_SECRET = config('MERCADOPAGO_WEBHOOK_SECRET', default='')
MERCADOPAGO_PUBLIC_KEY = config('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY', default='')

# ==================================
# CURRENCY & GEOIP CONFIGURATION
# ==================================

# Exchange Rate API (para conversión de monedas)
EXCHANGE_RATE_API_KEY = config('EXCHANGE_RATE_API_KEY', default='')
EXCHANGE_RATE_API_URL = config('EXCHANGE_RATE_API_URL', default='https://api.exchangerate-api.com/v4/latest/USD')

# GeoIP Service (para detección de país por IP)
GEOIP_SERVICE_URL = config('GEOIP_SERVICE_URL', default='https://ipapi.co')
GEOIP_SERVICE_API_KEY = config('GEOIP_SERVICE_API_KEY', default='')  # Opcional para servicios premium

# Tasa de cambio USD -> PEN por defecto (fallback si API falla)
DEFAULT_USD_TO_PEN_RATE = config('DEFAULT_USD_TO_PEN_RATE', default='3.75', cast=float)

# PASSWORD RESET CONFIGURATION

# Tiempo de expiración del token de reset (en horas)
PASSWORD_RESET_TOKEN_EXPIRY_HOURS = config('PASSWORD_RESET_TOKEN_EXPIRY_HOURS', default=1, cast=int)

# Rate limiting: máximo número de solicitudes de reset por hora por email
PASSWORD_RESET_RATE_LIMIT = config('PASSWORD_RESET_RATE_LIMIT', default=3, cast=int)

# ==================================
# AWS S3 CONFIGURATION (Para certificados y archivos)
# ==================================

USE_S3 = config('USE_S3', default=False, cast=bool)
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='')
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = 'private'
AWS_S3_VERIFY = True

# URLs firmadas expiran en 1 hora por defecto
AWS_QUERYSTRING_EXPIRE = 3600

# ==================================
# AZURE BLOB STORAGE CONFIGURATION (Para imágenes de cursos)
# ==================================

USE_AZURE_STORAGE = config('USE_AZURE_STORAGE', default=False, cast=bool)
AZURE_STORAGE_ACCOUNT_NAME = config('AZURE_STORAGE_ACCOUNT_NAME', default='')
AZURE_STORAGE_ACCOUNT_KEY = config('AZURE_STORAGE_ACCOUNT_KEY', default='')
AZURE_STORAGE_CONTAINER_NAME = config('AZURE_STORAGE_CONTAINER_NAME', default='fagsol-media')

# ==================================
# OPENAPI/SWAGGER CONFIGURATION
# ==================================

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'JWT Authorization header usando el esquema Bearer. Ingresa SOLO el token (sin "Bearer "). Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
    },
    'USE_SESSION_AUTH': False,  # No usar autenticación de sesión
    'JSON_EDITOR': True,
    'SUPPORTED_SUBMIT_METHODS': [
        'get',
        'post',
        'put',
        'delete',
        'patch'
    ],
    'OPERATIONS_SORTER': 'alpha',
    'TAGS_SORTER': 'alpha',
    'DOC_EXPANSION': 'none',
    'DEEP_LINKING': True,
    'SHOW_EXTENSIONS': True,
    'DEFAULT_MODEL_RENDERING': 'example',
    # Seguridad: No exponer información sensible
    'HIDE_SENSITIVE_SCHEMAS': True,
}

# ==================================
# LOGGING CONFIGURATION
# ==================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose'
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Crear directorio de logs si no existe
import os
os.makedirs(BASE_DIR / 'logs', exist_ok=True)


#CONTACT_EMAIL = config('CONTACT_EMAIL', default='info@fagsol.com')