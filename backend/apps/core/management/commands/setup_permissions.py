"""
Comando de management para configurar permisos y grupos de Django

Este comando:
1. Crea los grupos de roles (Administradores, Instructores, Estudiantes, Invitados)
2. Crea permisos personalizados para cada acción
3. Asigna permisos a los grupos según el rol

Uso:
    python manage.py setup_permissions
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from apps.courses.models import Course, Module, Lesson
from apps.users.models import Enrollment
from apps.payments.models import Payment, PaymentIntent
import logging

logger = logging.getLogger('apps')


class Command(BaseCommand):
    help = 'Configura grupos y permisos de Django para el sistema de roles'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Elimina y recrea todos los grupos y permisos',
        )

    def handle(self, *args, **options):
        reset = options.get('reset', False)
        
        with transaction.atomic():
            if reset:
                self.stdout.write(self.style.WARNING('Eliminando grupos existentes...'))
                Group.objects.filter(name__in=[
                    'Administradores',
                    'Instructores',
                    'Estudiantes',
                    'Invitados'
                ]).delete()
            
            # 1. Crear grupos
            self.stdout.write(self.style.SUCCESS('Creando grupos...'))
            admin_group, _ = Group.objects.get_or_create(name='Administradores')
            instructor_group, _ = Group.objects.get_or_create(name='Instructores')
            student_group, _ = Group.objects.get_or_create(name='Estudiantes')
            guest_group, _ = Group.objects.get_or_create(name='Invitados')
            
            # 2. Obtener ContentTypes
            course_ct = ContentType.objects.get_for_model(Course)
            module_ct = ContentType.objects.get_for_model(Module)
            lesson_ct = ContentType.objects.get_for_model(Lesson)
            enrollment_ct = ContentType.objects.get_for_model(Enrollment)
            payment_ct = ContentType.objects.get_for_model(Payment)
            payment_intent_ct = ContentType.objects.get_for_model(PaymentIntent)
            
            # 3. Crear permisos personalizados si no existen
            self.stdout.write(self.style.SUCCESS('Creando permisos personalizados...'))
            
            # Permisos para Cursos
            course_permissions = {
                'courses.view_course': 'Puede ver cursos',
                'courses.add_course': 'Puede crear cursos',
                'courses.change_course': 'Puede editar cursos',
                'courses.delete_course': 'Puede eliminar cursos',
                'courses.publish_course': 'Puede publicar cursos',
                'courses.manage_all_courses': 'Puede gestionar todos los cursos',
            }
            
            # Permisos para Módulos
            module_permissions = {
                'courses.view_module': 'Puede ver módulos',
                'courses.add_module': 'Puede crear módulos',
                'courses.change_module': 'Puede editar módulos',
                'courses.delete_module': 'Puede eliminar módulos',
            }
            
            # Permisos para Lecciones
            lesson_permissions = {
                'courses.view_lesson': 'Puede ver lecciones',
                'courses.add_lesson': 'Puede crear lecciones',
                'courses.change_lesson': 'Puede editar lecciones',
                'courses.delete_lesson': 'Puede eliminar lecciones',
            }
            
            # Permisos para Enrollments
            enrollment_permissions = {
                'users.view_enrollment': 'Puede ver inscripciones',
                'users.add_enrollment': 'Puede crear inscripciones',
                'users.change_enrollment': 'Puede editar inscripciones',
                'users.view_own_enrollment': 'Puede ver sus propias inscripciones',
            }
            
            # Permisos para Pagos
            payment_permissions = {
                'payments.view_payment': 'Puede ver pagos',
                'payments.process_payment': 'Puede procesar pagos',
                'payments.view_own_payment': 'Puede ver sus propios pagos',
                'payments.view_payment_intent': 'Puede ver payment intents',
            }
            
            # Permisos para Usuarios (admin)
            user_permissions = {
                'users.manage_users': 'Puede gestionar usuarios',
                'users.view_all_users': 'Puede ver todos los usuarios',
                'users.change_user_role': 'Puede cambiar roles de usuarios',
            }
            
            # Crear todos los permisos
            all_permissions = {}
            all_permissions.update(course_permissions)
            all_permissions.update(module_permissions)
            all_permissions.update(lesson_permissions)
            all_permissions.update(enrollment_permissions)
            all_permissions.update(payment_permissions)
            all_permissions.update(user_permissions)
            
            created_permissions = {}
            for codename, name in all_permissions.items():
                app_label, perm_codename = codename.split('.', 1)
                
                # Determinar ContentType según el app_label y tipo de permiso
                if app_label == 'courses':
                    if 'course' in perm_codename:
                        ct = course_ct
                    elif 'module' in perm_codename:
                        ct = module_ct
                    elif 'lesson' in perm_codename:
                        ct = lesson_ct
                    else:
                        ct = course_ct
                elif app_label == 'users':
                    if 'enrollment' in perm_codename:
                        ct = enrollment_ct
                    else:
                        # Para permisos de usuarios, usar User model
                        from django.contrib.auth.models import User
                        ct = ContentType.objects.get_for_model(User)
                elif app_label == 'payments':
                    if 'intent' in perm_codename:
                        ct = payment_intent_ct
                    elif 'payment' in perm_codename:
                        ct = payment_ct
                    else:
                        ct = payment_ct
                else:
                    ct = course_ct
                
                perm, created = Permission.objects.get_or_create(
                    codename=perm_codename,
                    content_type=ct,
                    defaults={'name': name}
                )
                created_permissions[codename] = perm
                if created:
                    self.stdout.write(f'  ✓ Creado permiso: {codename}')
            
            # 4. Asignar permisos a grupos
            
            # ADMINISTRADORES - Todos los permisos
            self.stdout.write(self.style.SUCCESS('Asignando permisos a Administradores...'))
            admin_group.permissions.set(created_permissions.values())
            self.stdout.write(f'  ✓ {admin_group.permissions.count()} permisos asignados')
            
            # INSTRUCTORES - Permisos de cursos (crear, editar, ver sus cursos)
            self.stdout.write(self.style.SUCCESS('Asignando permisos a Instructores...'))
            instructor_perms = [
                created_permissions['courses.view_course'],
                created_permissions['courses.add_course'],
                created_permissions['courses.change_course'],
                created_permissions['courses.view_module'],
                created_permissions['courses.add_module'],
                created_permissions['courses.change_module'],
                created_permissions['courses.delete_module'],
                created_permissions['courses.view_lesson'],
                created_permissions['courses.add_lesson'],
                created_permissions['courses.change_lesson'],
                created_permissions['courses.delete_lesson'],
                created_permissions['users.view_enrollment'],  # Ver inscripciones de sus cursos
            ]
            instructor_group.permissions.set(instructor_perms)
            self.stdout.write(f'  ✓ {instructor_group.permissions.count()} permisos asignados')
            
            # ESTUDIANTES - Solo ver y acceder a contenido
            self.stdout.write(self.style.SUCCESS('Asignando permisos a Estudiantes...'))
            student_perms = [
                created_permissions['courses.view_course'],  # Ver cursos publicados
                created_permissions['courses.view_module'],  # Ver módulos de cursos inscritos
                created_permissions['courses.view_lesson'],  # Ver lecciones de cursos inscritos
                created_permissions['users.view_own_enrollment'],  # Ver sus propias inscripciones
                created_permissions['payments.process_payment'],  # Procesar pagos
                created_permissions['payments.view_own_payment'],  # Ver sus propios pagos
                created_permissions['payments.view_payment_intent'],  # Ver sus payment intents
            ]
            student_group.permissions.set(student_perms)
            self.stdout.write(f'  ✓ {student_group.permissions.count()} permisos asignados')
            
            # INVITADOS - Solo ver cursos publicados
            self.stdout.write(self.style.SUCCESS('Asignando permisos a Invitados...'))
            guest_perms = [
                created_permissions['courses.view_course'],  # Solo ver cursos publicados
            ]
            guest_group.permissions.set(guest_perms)
            self.stdout.write(f'  ✓ {guest_group.permissions.count()} permisos asignados')
            
            self.stdout.write(self.style.SUCCESS('\n Permisos configurados correctamente!'))
            self.stdout.write('\nResumen:')
            self.stdout.write(f'  - Administradores: {admin_group.permissions.count()} permisos')
            self.stdout.write(f'  - Instructores: {instructor_group.permissions.count()} permisos')
            self.stdout.write(f'  - Estudiantes: {student_group.permissions.count()} permisos')
            self.stdout.write(f'  - Invitados: {guest_group.permissions.count()} permisos')

