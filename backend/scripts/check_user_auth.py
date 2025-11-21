"""
Script de utilidad para verificar y corregir problemas de autenticación de usuarios
Uso: python manage.py shell < scripts/check_user_auth.py
O: python manage.py shell
>>> exec(open('scripts/check_user_auth.py').read())
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password
from axes.models import AccessAttempt
from axes.utils import reset

User = get_user_model()

def check_user(email):
    """Verifica el estado de un usuario y sus credenciales"""
    print(f"\n{'='*60}")
    print(f"Verificando usuario: {email}")
    print(f"{'='*60}")
    
    try:
        user = User.objects.get(email=email)
        print(f"✓ Usuario encontrado:")
        print(f"  - ID: {user.id}")
        print(f"  - Username: {user.username}")
        print(f"  - Email: {user.email}")
        print(f"  - Activo: {user.is_active}")
        print(f"  - Nombre: {user.first_name} {user.last_name}")
        
        # Verificar bloqueos de AXES
        attempts = AccessAttempt.objects.filter(username=user.username)
        if attempts.exists():
            print(f"\n⚠ Bloqueos de AXES encontrados:")
            for attempt in attempts:
                print(f"  - Intentos fallidos: {attempt.failures_since_start}")
                print(f"  - Bloqueado: {attempt.locked_out}")
                print(f"  - IP: {attempt.ip_address}")
        else:
            print(f"\n✓ No hay bloqueos de AXES")
        
        return user
        
    except User.DoesNotExist:
        print(f"✗ Usuario NO encontrado con email: {email}")
        return None

def test_password(user, password):
    """Prueba si una contraseña es correcta para un usuario"""
    print(f"\n{'='*60}")
    print(f"Probando contraseña para: {user.email}")
    print(f"{'='*60}")
    
    # Método 1: Usando authenticate
    authenticated_user = authenticate(username=user.username, password=password)
    if authenticated_user:
        print(f"✓ Autenticación exitosa con username: {user.username}")
    else:
        print(f"✗ Autenticación fallida con username: {user.username}")
    
    # Método 2: Verificar hash directamente
    if check_password(password, user.password):
        print(f"✓ Contraseña correcta (verificación directa)")
    else:
        print(f"✗ Contraseña incorrecta (verificación directa)")
    
    return authenticated_user is not None

def reset_axes_locks(email):
    """Resetea los bloqueos de AXES para un usuario"""
    try:
        user = User.objects.get(email=email)
        reset(username=user.username)
        print(f"✓ Bloqueos de AXES reseteados para: {user.username}")
        return True
    except User.DoesNotExist:
        print(f"✗ Usuario no encontrado: {email}")
        return False

def fix_user_username(email):
    """Corrige el username de un usuario para que coincida con su email"""
    try:
        user = User.objects.get(email=email)
        if user.username != email:
            print(f"\n{'='*60}")
            print(f"Corrigiendo username de usuario")
            print(f"{'='*60}")
            print(f"  - Username actual: {user.username}")
            print(f"  - Email: {user.email}")
            print(f"  - Nuevo username: {email}")
            
            # Verificar si el nuevo username ya existe
            if User.objects.filter(username=email).exclude(id=user.id).exists():
                print(f"✗ No se puede cambiar: ya existe otro usuario con username={email}")
                return False
            
            user.username = email
            user.save()
            print(f"✓ Username actualizado correctamente")
            return True
        else:
            print(f"✓ Username ya coincide con email")
            return True
    except User.DoesNotExist:
        print(f"✗ Usuario no encontrado: {email}")
        return False

# Ejemplo de uso
if __name__ == "__main__":
    # Cambiar este email por el que quieras verificar
    email_to_check = "pedrito@gmail.com"
    
    # 1. Verificar usuario
    user = check_user(email_to_check)
    
    if user:
        # 2. Probar contraseña (cambiar por la contraseña real)
        # test_password(user, "1234")
        
        # 3. Resetear bloqueos de AXES si es necesario
        # reset_axes_locks(email_to_check)
        
        # 4. Corregir username si es necesario
        # fix_user_username(email_to_check)
        
        print(f"\n{'='*60}")
        print("Para probar la contraseña, ejecuta:")
        print(f"  test_password(user, 'tu_contraseña')")
        print("\nPara resetear bloqueos de AXES, ejecuta:")
        print(f"  reset_axes_locks('{email_to_check}')")
        print("\nPara corregir el username, ejecuta:")
        print(f"  fix_user_username('{email_to_check}')")
        print(f"{'='*60}")

