#!/usr/bin/env python
"""
Script para crear superusuario si no existe
Uso: python create_superuser.py
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(is_superuser=True).exists():
    user = User.objects.create_superuser(
        username='admin',
        email='admin@fagsol.com',
        password='admin123'
    )
    print('✅ Superusuario creado: admin / admin123')
else:
    print('ℹ️  Superusuario ya existe')

