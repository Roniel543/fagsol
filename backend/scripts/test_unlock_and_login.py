"""
Script para probar el desbloqueo y login de un usuario
Uso: python manage.py shell < scripts/test_unlock_and_login.py
O: python manage.py shell
>>> exec(open('scripts/test_unlock_and_login.py').read())
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from axes.models import AccessAttempt
from axes.utils import reset
from infrastructure.services.auth_service import AuthService

User = get_user_model()

def test_unlock_and_login(email, password):
    """Prueba el desbloqueo y login de un usuario"""
    print(f"\n{'='*60}")
    print(f"PRUEBA DE DESBLOQUEO Y LOGIN")
    print(f"{'='*60}")
    print(f"Email: {email}")
    print(f"{'='*60}\n")
    
    # 1. Verificar estado inicial
    print("1. VERIFICANDO ESTADO INICIAL...")
    try:
        user = User.objects.get(email=email)
        print(f"✓ Usuario encontrado:")
        print(f"  - ID: {user.id}")
        print(f"  - Username: {user.username}")
        print(f"  - Email: {user.email}")
        print(f"  - Activo: {user.is_active}")
    except User.DoesNotExist:
        print(f"✗ Usuario NO encontrado: {email}")
        return False
    
    # 2. Verificar bloqueos de AXES
    print(f"\n2. VERIFICANDO BLOQUEOS DE AXES...")
    attempts = AccessAttempt.objects.filter(
        username__in=[user.username, email]
    )
    
    if attempts.exists():
        print(f"⚠ Bloqueos encontrados:")
        for attempt in attempts:
            print(f"  - Username: {attempt.username}")
            print(f"  - Fallos: {attempt.failures_since_start}")
            print(f"  - IP: {attempt.ip_address}")
            print(f"  - Último intento: {attempt.attempt_time}")
    else:
        print(f"✓ No hay bloqueos de AXES")
    
    # 3. Desbloquear usuario
    print(f"\n3. DESBLOQUEANDO USUARIO...")
    try:
        # Resetear por username
        reset(username=user.username)
        print(f"✓ Reset por username: {user.username}")
        
        # Resetear por email también
        if email != user.username:
            reset(username=email)
            print(f"✓ Reset por email: {email}")
        
        # Eliminar AccessAttempt
        deleted = attempts.delete()
        print(f"✓ Eliminados {deleted[0]} AccessAttempt")
        
        # Verificar que se eliminaron
        remaining = AccessAttempt.objects.filter(
            username__in=[user.username, email]
        ).count()
        
        if remaining == 0:
            print(f"✓ Usuario desbloqueado correctamente")
        else:
            print(f"⚠ Aún quedan {remaining} AccessAttempt")
            
    except Exception as e:
        print(f"✗ Error al desbloquear: {str(e)}")
        return False
    
    # 4. Probar login con AuthService
    print(f"\n4. PROBANDO LOGIN CON AUTHSERVICE...")
    try:
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.post('/api/v1/auth/login/')
        
        # Simular request con IP
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        
        auth_service = AuthService()
        result = auth_service.login(email, password, request=request)
        
        if result.get('success'):
            print(f"✓ Login exitoso!")
            print(f"  - Usuario: {result['user']['email']}")
            print(f"  - Nombre: {result['user']['first_name']} {result['user']['last_name']}")
            print(f"  - Rol: {result['user']['role']}")
            print(f"  - Token generado: {'Sí' if 'tokens' in result else 'No'}")
            return True
        else:
            print(f"✗ Login fallido:")
            print(f"  - Mensaje: {result.get('message', 'Sin mensaje')}")
            print(f"  - Bloqueado: {result.get('is_locked', False)}")
            return False
            
    except Exception as e:
        print(f"✗ Error al probar login: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    # 5. Verificar que no hay nuevos bloqueos
    print(f"\n5. VERIFICANDO QUE NO HAY NUEVOS BLOQUEOS...")
    new_attempts = AccessAttempt.objects.filter(
        username__in=[user.username, email]
    )
    
    if new_attempts.exists():
        print(f"⚠ Nuevos bloqueos encontrados después del login:")
        for attempt in new_attempts:
            print(f"  - Fallos: {attempt.failures_since_start}")
    else:
        print(f"✓ No hay nuevos bloqueos (login exitoso resetea el contador)")
    
    print(f"\n{'='*60}")
    print(f"PRUEBA COMPLETADA")
    print(f"{'='*60}\n")
    
    return True

# Ejecutar prueba
if __name__ == '__main__':
    email = 'deadmau5rezz@gmail.com'
    password = '123'
    
    success = test_unlock_and_login(email, password)
    
    if success:
        print("✅ PRUEBA EXITOSA: El desbloqueo y login funcionan correctamente")
    else:
        print("❌ PRUEBA FALLIDA: Hay problemas con el desbloqueo o login")

