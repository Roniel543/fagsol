"""
Endpoints de Cursos - FagSol Escuela Virtual
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.courses.models import Course, Module, Lesson
from apps.users.models import Enrollment
from apps.users.permissions import (
    can_view_course, can_access_course_content, IsAdminOrInstructor, IsAdmin, is_admin
)
from infrastructure.services.course_service import CourseService
from infrastructure.services.course_approval_service import CourseApprovalService
from decimal import Decimal
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger('apps')


@swagger_auto_schema(
    method='get',
    operation_description='Lista todos los cursos disponibles según los permisos del usuario',
    manual_parameters=[
        openapi.Parameter(
            'status',
            openapi.IN_QUERY,
            description='Filtro por estado (published, draft)',
            type=openapi.TYPE_STRING,
            enum=['published', 'draft']
        ),
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description='Búsqueda por título',
            type=openapi.TYPE_STRING
        ),
    ],
    responses={
        200: openapi.Response(
            description='Lista de cursos',
            examples={
                'application/json': {
                    'success': True,
                    'data': [
                        {
                            'id': 'course-1',
                            'title': 'Curso de Ejemplo',
                            'slug': 'curso-de-ejemplo',
                            'price': 100.00,
                            'currency': 'PEN',
                            'status': 'published'
                        }
                    ],
                    'count': 1
                }
            }
        ),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Cursos']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def list_courses(request):
    """
    Lista todos los cursos publicados
    GET /api/v1/courses/
    
    Query params:
    - status: filtro por estado (published, draft)
    - search: búsqueda por título
    
    Permisos:
    - Público: Solo muestra cursos publicados
    - Autenticado: Muestra cursos publicados + cursos en los que está inscrito
    """
    try:
        # Filtros
        status_filter = request.query_params.get('status', 'published')
        search = request.query_params.get('search', '')
        
        # Query base
        queryset = Course.objects.filter(is_active=True)
        
        # Filtrar por estado
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Búsqueda
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        # Filtrar según permisos del usuario
        filtered_courses = []
        for course in queryset:
            if can_view_course(request.user, course):
                filtered_courses.append(course)
        
        # Serializar
        courses = []
        for course in filtered_courses:
            courses.append({
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'short_description': course.short_description or course.description[:200] + '...' if len(course.description) > 200 else course.description,
                'price': float(course.price),
                'discount_price': float(course.discount_price) if course.discount_price else None,
                'currency': course.currency,
                'thumbnail_url': course.thumbnail_url,
                'status': course.status,
                'category': course.category,
                'level': course.level,
                'provider': course.provider,
                'tags': course.tags,
                'hours': course.hours,
                'rating': float(course.rating),
                'ratings_count': course.ratings_count,
                'instructor': course.instructor if course.instructor else {'id': 'i-001', 'name': 'Equipo Fagsol'},
                'created_at': course.created_at.isoformat(),
            })
        
        return Response({
            'success': True,
            'data': courses,
            'count': len(courses)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en list_courses: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene un curso por slug',
    manual_parameters=[
        openapi.Parameter(
            'slug',
            openapi.IN_PATH,
            description='Slug del curso',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(description='Detalle del curso'),
        404: openapi.Response(description='Curso no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Cursos']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_course_by_slug(request, slug):
    """
    Obtiene los detalles de un curso por slug
    GET /api/v1/courses/slug/{slug}/
    """
    try:
        # Obtener curso por slug
        course = get_object_or_404(Course, slug=slug, is_active=True)
        
        # Verificar permisos
        if not can_view_course(request.user, course):
            return Response({
                'success': False,
                'message': 'No tienes permiso para ver este curso'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener módulos
        modules = []
        for module in course.modules.filter(is_active=True).order_by('order'):
            lessons = []
            for lesson in module.lessons.filter(is_active=True).order_by('order'):
                lessons.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'lesson_type': lesson.lesson_type,
                    'duration_minutes': lesson.duration_minutes,
                    'order': lesson.order
                })
            
            modules.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'price': float(module.price) if module.is_purchasable else None,
                'is_purchasable': module.is_purchasable,
                'lessons': lessons,
                'order': module.order
            })
        
        # Verificar si el usuario está inscrito (si está autenticado)
        is_enrolled = False
        if request.user.is_authenticated:
            is_enrolled = Enrollment.objects.filter(
                user=request.user,
                course=course,
                status='active'
            ).exists()
        
        return Response({
            'success': True,
            'data': {
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'description': course.description,
                'short_description': course.short_description,
                'price': float(course.price),
                'discount_price': float(course.discount_price) if course.discount_price else None,
                'currency': course.currency,
                'thumbnail_url': course.thumbnail_url,
                'banner_url': course.banner_url,
                'status': course.status,
                'category': course.category,
                'level': course.level,
                'provider': course.provider,
                'tags': course.tags,
                'hours': course.hours,
                'rating': float(course.rating),
                'ratings_count': course.ratings_count,
                'instructor': course.instructor if course.instructor else {'id': 'i-001', 'name': 'Equipo Fagsol'},
                'modules': modules,
                'is_enrolled': is_enrolled,
                'created_at': course.created_at.isoformat(),
            }
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Curso no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en get_course_by_slug: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene los detalles de un curso por ID',
    manual_parameters=[
        openapi.Parameter(
            'course_id',
            openapi.IN_PATH,
            description='ID del curso',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(description='Detalle del curso'),
        404: openapi.Response(description='Curso no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    tags=['Cursos']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_course(request, course_id):
    """
    Obtiene los detalles de un curso
    GET /api/v1/courses/{course_id}/
    
    Los administradores pueden ver cursos archivados.
    Los demás usuarios solo pueden ver cursos activos.
    """
    try:
        # Obtener curso
        # Los administradores pueden ver cualquier curso (incluso archivados)
        # Los demás usuarios solo pueden ver cursos activos
        if request.user.is_authenticated and is_admin(request.user):
            course = get_object_or_404(Course, id=course_id)
        else:
            course = get_object_or_404(Course, id=course_id, is_active=True)
        
        # Obtener módulos
        modules = []
        for module in course.modules.filter(is_active=True).order_by('order'):
            lessons = []
            for lesson in module.lessons.filter(is_active=True).order_by('order'):
                lessons.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'lesson_type': lesson.lesson_type,
                    'duration_minutes': lesson.duration_minutes,
                    'order': lesson.order
                })
            
            modules.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'price': float(module.price) if module.is_purchasable else None,
                'is_purchasable': module.is_purchasable,
                'lessons': lessons,
                'order': module.order
            })
        
        # Verificar si el usuario está inscrito (si está autenticado)
        is_enrolled = False
        if request.user.is_authenticated:
            is_enrolled = Enrollment.objects.filter(
                user=request.user,
                course=course,
                status='active'
            ).exists()
        
        return Response({
            'success': True,
            'data': {
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'description': course.description,
                'short_description': course.short_description,
                'price': float(course.price),
                'discount_price': float(course.discount_price) if course.discount_price else None,
                'currency': course.currency,
                'thumbnail_url': course.thumbnail_url,
                'banner_url': course.banner_url,
                'status': course.status,
                'category': course.category,
                'level': course.level,
                'provider': course.provider,
                'tags': course.tags,
                'hours': course.hours,
                'rating': float(course.rating),
                'ratings_count': course.ratings_count,
                'instructor': course.instructor if course.instructor else {'id': 'i-001', 'name': 'Equipo Fagsol'},
                'modules': modules,
                'is_enrolled': is_enrolled,
                'created_at': course.created_at.isoformat(),
            }
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Curso no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en get_course: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description='Obtiene el contenido completo de un curso. Requiere estar inscrito o tener rol admin/instructor',
    manual_parameters=[
        openapi.Parameter(
            'course_id',
            openapi.IN_PATH,
            description='ID del curso',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(description='Contenido del curso'),
        403: openapi.Response(description='No tienes acceso a este curso'),
        404: openapi.Response(description='Curso no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Cursos']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_content(request, course_id):
    """
    Obtiene el contenido completo de un curso (solo si el usuario tiene acceso)
    GET /api/v1/courses/{course_id}/content/
    
    Requiere autenticación y acceso al curso (enrollment activo o rol admin/instructor)
    """
    try:
        # Obtener curso
        course = get_object_or_404(Course, id=course_id, is_active=True)
        
        # Verificar permisos usando policy
        if not can_access_course_content(request.user, course):
            return Response({
                'success': False,
                'message': 'No tienes acceso a este curso. Debes estar inscrito.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener enrollment (si existe)
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=course,
            status='active'
        ).first()
        
        # Obtener contenido completo
        modules = []
        for module in course.modules.filter(is_active=True).order_by('order'):
            lessons = []
            for lesson in module.lessons.filter(is_active=True).order_by('order'):
                lesson_data = {
                    'id': lesson.id,
                    'title': lesson.title,
                    'description': lesson.description,
                    'lesson_type': lesson.lesson_type,
                    'duration_minutes': lesson.duration_minutes,
                    'order': lesson.order
                }
                
                # Incluir URL de contenido solo si está disponible
                if lesson.content_url:
                    lesson_data['content_url'] = lesson.content_url
                if lesson.content_text:
                    lesson_data['content_text'] = lesson.content_text
                
                lessons.append(lesson_data)
            
            modules.append({
                'id': module.id,
                'title': module.title,
                'description': module.description,
                'lessons': lessons,
                'order': module.order
            })
        
        # Preparar datos de respuesta
        response_data = {
            'course': {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'slug': course.slug,
            },
            'modules': modules
        }
        
        # Incluir enrollment solo si existe
        if enrollment:
            response_data['enrollment'] = {
                'id': enrollment.id,
                'status': enrollment.status,
                'completed': enrollment.completed,
                'completion_percentage': float(enrollment.completion_percentage),
                'enrolled_at': enrollment.enrolled_at.isoformat()
            }
        else:
            # Si es admin/instructor sin enrollment, indicar acceso especial
            response_data['access_type'] = 'admin_or_instructor'
        
        return Response({
            'success': True,
            'data': response_data
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Curso no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en get_course_content: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Crea un nuevo curso. Requiere rol admin o instructor',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['title', 'description', 'price'],
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING, description='Título del curso'),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description='Descripción completa'),
            'short_description': openapi.Schema(type=openapi.TYPE_STRING, description='Descripción corta'),
            'price': openapi.Schema(type=openapi.TYPE_NUMBER, description='Precio del curso'),
            'currency': openapi.Schema(type=openapi.TYPE_STRING, description='Moneda (PEN por defecto)'),
            'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['draft', 'published', 'archived'], description='Estado del curso'),
            'category': openapi.Schema(type=openapi.TYPE_STRING, description='Categoría'),
            'level': openapi.Schema(type=openapi.TYPE_STRING, enum=['beginner', 'intermediate', 'advanced'], description='Nivel'),
            'thumbnail_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_URI, description='URL de miniatura'),
            'banner_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_URI, description='URL de banner'),
            'discount_price': openapi.Schema(type=openapi.TYPE_NUMBER, description='Precio con descuento'),
            'hours': openapi.Schema(type=openapi.TYPE_INTEGER, description='Horas totales'),
            'instructor': openapi.Schema(type=openapi.TYPE_OBJECT, description='Información del instructor (JSON)'),
            'tags': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING), description='Tags del curso'),
        }
    ),
    responses={
        201: openapi.Response(description='Curso creado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No tienes permiso para crear cursos'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Cursos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrInstructor])
def create_course(request):
    """
    Crea un nuevo curso
    POST /api/v1/courses/
    
    Requiere autenticación y rol admin o instructor
    """
    try:
        # 1. Validar datos requeridos
        title = request.data.get('title')
        description = request.data.get('description')
        price = request.data.get('price')
        
        if not title or not description or price is None:
            return Response({
                'success': False,
                'message': 'Título, descripción y precio son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Convertir price a Decimal
        try:
            price_decimal = Decimal(str(price))
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'message': 'Precio inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Preparar kwargs
        kwargs = {}
        if 'short_description' in request.data:
            kwargs['short_description'] = request.data['short_description']
        if 'currency' in request.data:
            kwargs['currency'] = request.data['currency']
        if 'status' in request.data:
            kwargs['status'] = request.data['status']
        if 'category' in request.data:
            kwargs['category'] = request.data['category']
        if 'level' in request.data:
            kwargs['level'] = request.data['level']
        if 'thumbnail_url' in request.data:
            kwargs['thumbnail_url'] = request.data['thumbnail_url']
        if 'banner_url' in request.data:
            kwargs['banner_url'] = request.data['banner_url']
        if 'discount_price' in request.data:
            try:
                kwargs['discount_price'] = Decimal(str(request.data['discount_price']))
            except (ValueError, TypeError):
                pass
        if 'hours' in request.data:
            try:
                kwargs['hours'] = int(request.data['hours'])
            except (ValueError, TypeError):
                pass
        if 'instructor' in request.data:
            kwargs['instructor'] = request.data['instructor']
        if 'tags' in request.data:
            kwargs['tags'] = request.data['tags']
        if 'provider' in request.data:
            kwargs['provider'] = request.data['provider']
        
        # 4. Usar servicio para crear curso
        course_service = CourseService()
        success, course, error_message = course_service.create_course(
            user=request.user,
            title=title,
            description=description,
            price=price_decimal,
            **kwargs
        )
        
        if not success:
            return Response({
                'success': False,
                'message': error_message
            }, status=status.HTTP_400_BAD_REQUEST if 'requerido' in error_message.lower() or 'inválido' in error_message.lower() else status.HTTP_403_FORBIDDEN)
        
        # 5. Serializar respuesta
        return Response({
            'success': True,
            'data': {
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'description': course.description,
                'short_description': course.short_description,
                'price': float(course.price),
                'currency': course.currency,
                'status': course.status,
                'category': course.category,
                'level': course.level,
                'created_at': course.created_at.isoformat(),
            },
            'message': 'Curso creado exitosamente'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error en create_course: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='put',
    operation_description='Actualiza un curso existente. Requiere rol admin o instructor',
    manual_parameters=[
        openapi.Parameter(
            'course_id',
            openapi.IN_PATH,
            description='ID del curso',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING, description='Título del curso'),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description='Descripción completa'),
            'short_description': openapi.Schema(type=openapi.TYPE_STRING, description='Descripción corta'),
            'price': openapi.Schema(type=openapi.TYPE_NUMBER, description='Precio del curso'),
            'currency': openapi.Schema(type=openapi.TYPE_STRING, description='Moneda'),
            'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['draft', 'published', 'archived'], description='Estado del curso'),
            'category': openapi.Schema(type=openapi.TYPE_STRING, description='Categoría'),
            'level': openapi.Schema(type=openapi.TYPE_STRING, enum=['beginner', 'intermediate', 'advanced'], description='Nivel'),
            'thumbnail_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_URI, description='URL de miniatura'),
            'banner_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_URI, description='URL de banner'),
            'discount_price': openapi.Schema(type=openapi.TYPE_NUMBER, description='Precio con descuento'),
            'hours': openapi.Schema(type=openapi.TYPE_INTEGER, description='Horas totales'),
            'instructor': openapi.Schema(type=openapi.TYPE_OBJECT, description='Información del instructor (JSON)'),
            'tags': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING), description='Tags del curso'),
        }
    ),
    responses={
        200: openapi.Response(description='Curso actualizado exitosamente'),
        400: openapi.Response(description='Datos inválidos'),
        403: openapi.Response(description='No tienes permiso para editar este curso'),
        404: openapi.Response(description='Curso no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Cursos']
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminOrInstructor])
def update_course(request, course_id):
    """
    Actualiza un curso existente
    PUT /api/v1/courses/{course_id}/
    
    Requiere autenticación y permiso para editar el curso
    """
    try:
        # 1. Preparar kwargs con solo los campos que se envían
        kwargs = {}
        
        if 'title' in request.data:
            kwargs['title'] = request.data['title']
        if 'description' in request.data:
            kwargs['description'] = request.data['description']
        if 'short_description' in request.data:
            kwargs['short_description'] = request.data['short_description']
        if 'price' in request.data:
            try:
                kwargs['price'] = Decimal(str(request.data['price']))
            except (ValueError, TypeError):
                return Response({
                    'success': False,
                    'message': 'Precio inválido'
                }, status=status.HTTP_400_BAD_REQUEST)
        if 'currency' in request.data:
            kwargs['currency'] = request.data['currency']
        if 'status' in request.data:
            kwargs['status'] = request.data['status']
        if 'category' in request.data:
            kwargs['category'] = request.data['category']
        if 'level' in request.data:
            kwargs['level'] = request.data['level']
        if 'thumbnail_url' in request.data:
            kwargs['thumbnail_url'] = request.data['thumbnail_url']
        if 'banner_url' in request.data:
            kwargs['banner_url'] = request.data['banner_url']
        if 'discount_price' in request.data:
            try:
                kwargs['discount_price'] = Decimal(str(request.data['discount_price']))
            except (ValueError, TypeError):
                pass
        if 'hours' in request.data:
            try:
                kwargs['hours'] = int(request.data['hours'])
            except (ValueError, TypeError):
                pass
        if 'instructor' in request.data:
            kwargs['instructor'] = request.data['instructor']
        if 'tags' in request.data:
            kwargs['tags'] = request.data['tags']
        
        # 2. Validar que al menos un campo se está actualizando
        if not kwargs:
            return Response({
                'success': False,
                'message': 'Debes enviar al menos un campo para actualizar'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Usar servicio para actualizar curso
        course_service = CourseService()
        success, course, error_message = course_service.update_course(
            user=request.user,
            course_id=course_id,
            **kwargs
        )
        
        if not success:
            status_code = status.HTTP_404_NOT_FOUND if 'no encontrado' in error_message.lower() else (
                status.HTTP_403_FORBIDDEN if 'permiso' in error_message.lower() else status.HTTP_400_BAD_REQUEST
            )
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        # 4. Serializar respuesta
        return Response({
            'success': True,
            'data': {
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'description': course.description,
                'short_description': course.short_description,
                'price': float(course.price),
                'discount_price': float(course.discount_price) if course.discount_price else None,
                'currency': course.currency,
                'status': course.status,
                'category': course.category,
                'level': course.level,
                'updated_at': course.updated_at.isoformat(),
            },
            'message': 'Curso actualizado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en update_course: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='delete',
    operation_description='Elimina (archiva) un curso. Solo administradores pueden eliminar cursos',
    manual_parameters=[
        openapi.Parameter(
            'course_id',
            openapi.IN_PATH,
            description='ID del curso',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(description='Curso eliminado exitosamente'),
        403: openapi.Response(description='Solo los administradores pueden eliminar cursos'),
        404: openapi.Response(description='Curso no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Cursos']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_course(request, course_id):
    """
    Elimina (archiva) un curso (soft delete)
    DELETE /api/v1/courses/{course_id}/
    
    Solo administradores pueden eliminar cursos
    """
    try:
        # 1. Usar servicio para eliminar curso
        course_service = CourseService()
        success, error_message = course_service.delete_course(
            user=request.user,
            course_id=course_id
        )
        
        if not success:
            status_code = status.HTTP_404_NOT_FOUND if 'no encontrado' in error_message.lower() else status.HTTP_403_FORBIDDEN
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        # 2. Retornar respuesta
        return Response({
            'success': True,
            'message': 'Curso eliminado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en delete_course: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    operation_description='Solicita revisión de un curso. Solo instructores pueden solicitar revisión de sus cursos.',
    manual_parameters=[
        openapi.Parameter(
            'course_id',
            openapi.IN_PATH,
            description='ID del curso',
            type=openapi.TYPE_STRING,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(description='Revisión solicitada exitosamente'),
        400: openapi.Response(description='El curso no puede solicitar revisión'),
        403: openapi.Response(description='No tienes permiso para solicitar revisión de este curso'),
        404: openapi.Response(description='Curso no encontrado'),
        500: openapi.Response(description='Error interno del servidor')
    },
    security=[{'Bearer': []}],
    tags=['Cursos']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrInstructor])
def request_course_review(request, course_id):
    """
    Solicita revisión de un curso (instructor)
    POST /api/v1/courses/{course_id}/request-review/
    
    Requiere autenticación y rol instructor
    """
    try:
        service = CourseApprovalService()
        success, data, error_message = service.request_review(
            instructor_user=request.user,
            course_id=course_id
        )
        
        if not success:
            # Determinar código de estado apropiado
            if 'no encontrado' in error_message.lower():
                status_code = status.HTTP_404_NOT_FOUND
            elif 'permiso' in error_message.lower():
                status_code = status.HTTP_403_FORBIDDEN
            elif 'no puede solicitar' in error_message.lower():
                status_code = status.HTTP_400_BAD_REQUEST
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            
            return Response({
                'success': False,
                'message': error_message
            }, status=status_code)
        
        return Response({
            'success': True,
            'data': data,
            'message': 'Revisión solicitada exitosamente. El administrador revisará tu curso.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en request_course_review: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

