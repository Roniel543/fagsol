"""
Script rápido para probar el login de un usuario
Uso: python manage.py shell < scripts/test_login.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password

User = get_user_model()
email = "pedrito@gmail.com"
password = "1234"

print(f"\n{'='*60}")
print(f"PROBANDO LOGIN: {email}")
print(f"{'='*60}\n")

try:
    # 1. Buscar usuario
    user = User.objects.get(email=email)
    print(f"✓ Usuario encontrado:")
    print(f"  - ID: {user.id}")
    print(f"  - Username: {user.username}")
    print(f"  - Email: {user.email}")
    print(f"  - Activo: {user.is_active}")
    
    # 2. Verificar contraseña directamente
    print(f"\n{'='*60}")
    print("VERIFICANDO CONTRASEÑA:")
    print(f"{'='*60}")
    
    if check_password(password, user.password):
        print(f"✓ Contraseña '{password}' es CORRECTA (verificación directa)")
    else:
        print(f"✗ Contraseña '{password}' es INCORRECTA (verificación directa)")
        print(f"  Hash almacenado: {user.password[:50]}...")
    
    # 3. Verificar bloqueos de AXES PRIMERO
    print(f"\n{'='*60}")
    print("VERIFICANDO BLOQUEOS DE AXES:")
    print(f"{'='*60}")
    
    try:
        from axes.models import AccessAttempt
        from axes.utils import reset
        
        # Buscar bloqueos por username
        attempts_username = AccessAttempt.objects.filter(username=user.username)
        # Buscar bloqueos por email también
        attempts_email = AccessAttempt.objects.filter(username=email)
        
        all_attempts = list(attempts_username) + list(attempts_email)
        
        if all_attempts:
            print(f"⚠ BLOQUEOS ENCONTRADOS:")
            for attempt in all_attempts:
                print(f"  - Username/IP: {attempt.username} / {attempt.ip_address}")
                print(f"  - Intentos fallidos: {attempt.failures_since_start}")
                print(f"  - Bloqueado: {attempt.locked_out}")
                print(f"  - Último intento: {attempt.attempt_time}")
            
            # Desbloquear automáticamente
            print(f"\n🔓 DESBLOQUEANDO...")
            reset(username=user.username)
            reset(username=email)
            print(f"✓ Bloqueos reseteados para: {user.username} y {email}")
        else:
            print(f"✓ No hay bloqueos de AXES")
    except Exception as e:
        print(f"⚠ Error al verificar AXES: {str(e)}")
    
    # 4. Probar authenticate con request mock (solo para verificar que funciona)
    print(f"\n{'='*60}")
    print("NOTA: authenticate() requiere request (AxesBackend)")
    print("En producción, el request viene del frontend")
    print(f"{'='*60}")
    
    # 5. Verificar bloqueos de AXES
    print(f"\n{'='*60}")
    print("VERIFICANDO BLOQUEOS DE AXES:")
    print(f"{'='*60}")
    
    try:
        from axes.models import AccessAttempt
        attempts = AccessAttempt.objects.filter(username=user.username)
        if attempts.exists():
            for attempt in attempts:
                print(f"⚠ Bloqueo encontrado:")
                print(f"  - Intentos fallidos: {attempt.failures_since_start}")
                print(f"  - Bloqueado: {attempt.locked_out}")
                print(f"  - IP: {attempt.ip_address}")
                print(f"  - Último intento: {attempt.attempt_time}")
        else:
            print(f"✓ No hay bloqueos de AXES")
    except Exception as e:
        print(f"⚠ Error al verificar AXES: {str(e)}")
    
    print(f"\n{'='*60}")
    print("RESUMEN:")
    print(f"{'='*60}")
    print(f"Usuario existe: ✓")
    print(f"Contraseña correcta: {'✓' if check_password(password, user.password) else '✗'}")
    print(f"Authenticate con username: {'✓' if auth_user else '✗'}")
    print(f"Authenticate con email: {'✓' if auth_user_email else '✗'}")
    print(f"Usuario activo: {'✓' if user.is_active else '✗'}")
    
except User.DoesNotExist:
    print(f"✗ Usuario NO encontrado: {email}")
except Exception as e:
    print(f"✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()

