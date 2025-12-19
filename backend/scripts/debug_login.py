"""
Script para debuggear problemas de login
Uso: python manage.py shell < scripts/debug_login.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password
from django.test import RequestFactory

User = get_user_model()

email = "admin@gmail.com"
password = "123"

print(f"\n{'='*60}")
print(f"DEBUGGING LOGIN PARA: {email}")
print(f"{'='*60}\n")

# 1. Verificar qué modelo se está usando
print("1. MODELO DE USUARIO:")
print(f"   - AUTH_USER_MODEL: {User}")
print(f"   - USERNAME_FIELD: {getattr(User, 'USERNAME_FIELD', 'username')}")
print(f"   - Clase: {User.__class__.__name__}")
print(f"   - Módulo: {User.__class__.__module__}")

# 2. Buscar usuario
print(f"\n{'='*60}")
print("2. BUSCAR USUARIO:")
print(f"{'='*60}")

try:
    user = User.objects.get(email=email)
    print(f"✓ Usuario encontrado:")
    print(f"   - ID: {user.id}")
    print(f"   - Username: '{user.username}'")
    print(f"   - Email: '{user.email}'")
    print(f"   - Activo: {user.is_active}")
    print(f"   - Es superuser: {user.is_superuser}")
    print(f"   - Es staff: {user.is_staff}")
    print(f"   - Hash password: {user.password[:50]}...")
except User.DoesNotExist:
    print(f"✗ Usuario NO encontrado con email: {email}")
    exit(1)

# 3. Verificar contraseña directamente
print(f"\n{'='*60}")
print("3. VERIFICAR CONTRASEÑA DIRECTAMENTE:")
print(f"{'='*60}")

if check_password(password, user.password):
    print(f"✓ Contraseña '{password}' es CORRECTA (check_password)")
else:
    print(f"✗ Contraseña '{password}' es INCORRECTA (check_password)")
    print(f"   Hash almacenado: {user.password[:50]}...")

# 4. Intentar autenticar con username
print(f"\n{'='*60}")
print("4. AUTENTICAR CON USERNAME:")
print(f"{'='*60}")

factory = RequestFactory()
request = factory.post('/api/v1/auth/login/')

authenticated_user = authenticate(request=request, username=user.username, password=password)
if authenticated_user:
    print(f"✓ Autenticación exitosa con username='{user.username}'")
else:
    print(f"✗ Autenticación fallida con username='{user.username}'")

# 5. Intentar autenticar con email
print(f"\n{'='*60}")
print("5. AUTENTICAR CON EMAIL:")
print(f"{'='*60}")

authenticated_user2 = authenticate(request=request, username=email, password=password)
if authenticated_user2:
    print(f"✓ Autenticación exitosa con username='{email}' (email)")
else:
    print(f"✗ Autenticación fallida con username='{email}' (email)")

# 6. Verificar bloqueos de AXES
print(f"\n{'='*60}")
print("6. VERIFICAR BLOQUEOS DE AXES:")
print(f"{'='*60}")

try:
    from axes.models import AccessAttempt
    
    attempts = AccessAttempt.objects.filter(
        username__in=[user.username, email]
    ).order_by('-attempt_time')
    
    if attempts.exists():
        print(f"⚠ Se encontraron {attempts.count()} intentos de acceso:")
        for attempt in attempts[:5]:
            print(f"   - Username: {attempt.username}")
            print(f"     IP: {attempt.ip_address}")
            print(f"     Fallos: {attempt.failures_since_start}")
            print(f"     Fecha: {attempt.attempt_time}")
    else:
        print("✓ No hay bloqueos de AXES")
except ImportError:
    print("⚠ AXES no está instalado")

# 7. Resumen
print(f"\n{'='*60}")
print("7. RESUMEN:")
print(f"{'='*60}")

username_field = getattr(User, 'USERNAME_FIELD', 'username')
print(f"USERNAME_FIELD del modelo: {username_field}")

if username_field == 'email':
    print("→ Debería autenticar con EMAIL")
    if authenticated_user2:
        print("✓ Login con EMAIL funciona")
    else:
        print("✗ Login con EMAIL NO funciona")
else:
    print("→ Debería autenticar con USERNAME")
    if authenticated_user:
        print("✓ Login con USERNAME funciona")
    else:
        print("✗ Login con USERNAME NO funciona")

print(f"\n{'='*60}\n")

