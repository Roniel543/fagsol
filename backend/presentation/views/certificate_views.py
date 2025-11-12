"""
Endpoints de Certificados - FagSol Escuela Virtual
"""

import logging
import qrcode
import io
import base64
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from apps.users.models import Certificate, Enrollment
from apps.courses.models import Course
from apps.users.permissions import (
    CanViewCertificate, can_view_certificate
)

logger = logging.getLogger('apps')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_certificate(request, course_id):
    """
    Genera URL firmada para descargar certificado
    GET /api/v1/certificates/{course_id}/download/
    
    Requiere que el usuario haya completado el curso
    """
    try:
        # 1. Obtener curso
        try:
            course = Course.objects.get(id=course_id, is_active=True)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Curso no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Verificar enrollment y completitud
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=course,
            status='active',
            completed=True
        ).first()
        
        if not enrollment:
            return Response({
                'success': False,
                'message': 'Debes completar el curso para obtener el certificado'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 3. Obtener o crear certificado
        certificate, created = Certificate.objects.get_or_create(
            enrollment=enrollment,
            defaults={
                'user': request.user,
                'course': course,
                'verification_code': f"CERT-{enrollment.id}-{request.user.id}-{course.id}",
            }
        )
        
        # 4. Verificar permisos para ver el certificado (protección IDOR)
        if not can_view_certificate(request.user, certificate):
            return Response({
                'success': False,
                'message': 'No tienes permiso para acceder a este certificado'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 4. Generar URL firmada (si está en S3) o URL directa
        if settings.USE_S3 and certificate.file_path:
            # En producción, usar S3 con URL firmada
            try:
                import boto3
                from botocore.exceptions import ClientError
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME
                )
                
                signed_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                        'Key': certificate.file_path
                    },
                    ExpiresIn=300  # 5 minutos
                )
            except (ClientError, ImportError) as e:
                logger.error(f"Error al generar URL firmada de S3: {str(e)}")
                signed_url = certificate.file_url or f"/media/certificates/{certificate.id}.pdf"
        else:
            # En desarrollo, usar URL directa o generar certificado
            signed_url = certificate.file_url or f"/media/certificates/{certificate.id}.pdf"
        
        # 5. URL de verificación
        verification_url = f"{settings.FRONTEND_URL}/verify/{certificate.verification_code}"
        certificate.verification_url = verification_url
        certificate.save()
        
        return Response({
            'success': True,
            'data': {
                'certificate_id': certificate.id,
                'signed_url': signed_url,
                'verification_code': certificate.verification_code,
                'verification_url': verification_url,
                'expires_in': 300  # 5 minutos
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en download_certificate: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([])  # Público
def verify_certificate(request, verification_code):
    """
    Verifica un certificado por código
    GET /api/v1/certificates/verify/{verification_code}/
    """
    try:
        certificate = Certificate.objects.get(verification_code=verification_code)
        
        return Response({
            'success': True,
            'data': {
                'certificate_id': certificate.id,
                'user': {
                    'name': f"{certificate.user.first_name} {certificate.user.last_name}",
                    'email': certificate.user.email,
                },
                'course': {
                    'title': certificate.course.title,
                    'id': certificate.course.id,
                },
                'issued_at': certificate.issued_at.isoformat(),
                'is_valid': True
            }
        }, status=status.HTTP_200_OK)
        
    except Certificate.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Certificado no encontrado o código inválido'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en verify_certificate: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

