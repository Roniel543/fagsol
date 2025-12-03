"""
Servicio de Solicitudes de Instructor - FagSol Escuela Virtual
Maneja la lógica de negocio para solicitudes de instructores
"""

import logging
from typing import Dict, Optional, Tuple
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.core.models import InstructorApplication, UserProfile

logger = logging.getLogger('apps')

# Días que deben pasar antes de poder volver a aplicar después de un rechazo
REAPPLY_COOLDOWN_DAYS = 30


class InstructorApplicationService:
    """
    Servicio que maneja la lógica de negocio para solicitudes de instructores
    """
    
    def __init__(self):
        pass
    
    def create_application(
        self,
        user,
        professional_title: str = '',
        experience_years: int = 0,
        specialization: str = '',
        bio: str = '',
        portfolio_url: str = '',
        motivation: str = '',
        cv_file=None
    ) -> Tuple[bool, Optional[InstructorApplication], str]:
        """
        Crea una nueva solicitud de instructor
        
        Args:
            user: Usuario que solicita ser instructor
            professional_title: Título profesional
            experience_years: Años de experiencia
            specialization: Especialidad
            bio: Biografía
            portfolio_url: URL del portfolio
            motivation: Motivación (requerido)
            cv_file: Archivo PDF del CV (opcional)
        
        Returns:
            Tuple[success, application, error_message]
        """
        try:
            # 1. Validar que el usuario no sea ya instructor
            try:
                profile = user.profile
                if profile.role == 'instructor':
                    return False, None, "Ya eres instructor. No necesitas solicitar nuevamente."
            except UserProfile.DoesNotExist:
                # Si no tiene perfil, crear uno como estudiante
                profile = UserProfile.objects.create(user=user, role='student')
            
            # 2. Validar que no tenga una solicitud pendiente
            pending_application = InstructorApplication.objects.filter(
                user=user,
                status='pending'
            ).first()
            
            if pending_application:
                return False, None, "Ya tienes una solicitud pendiente. Espera a que sea revisada."
            
            # 3. Validar tiempo de espera si hubo un rechazo reciente
            last_rejected = InstructorApplication.objects.filter(
                user=user,
                status='rejected'
            ).order_by('-reviewed_at').first()
            
            if last_rejected and last_rejected.reviewed_at:
                days_since_rejection = (timezone.now() - last_rejected.reviewed_at).days
                if days_since_rejection < REAPPLY_COOLDOWN_DAYS:
                    days_remaining = REAPPLY_COOLDOWN_DAYS - days_since_rejection
                    return False, None, f"Debes esperar {days_remaining} día(s) más antes de volver a aplicar. Tu última solicitud fue rechazada hace {days_since_rejection} día(s)."
            
            # 4. Validar campos requeridos
            if not motivation or not motivation.strip():
                return False, None, "La motivación es requerida. Cuéntanos por qué quieres ser instructor."
            
            # 5. Validar años de experiencia
            if experience_years < 0:
                experience_years = 0
            
            # 6. Validar URL del portfolio si se proporciona
            if portfolio_url and portfolio_url.strip():
                portfolio_url = portfolio_url.strip()
                if not portfolio_url.startswith(('http://', 'https://')):
                    return False, None, "La URL del portfolio debe comenzar con http:// o https://"
            
            # 7. Crear la solicitud
            application = InstructorApplication.objects.create(
                user=user,
                professional_title=professional_title.strip() if professional_title else '',
                experience_years=experience_years,
                specialization=specialization.strip() if specialization else '',
                bio=bio.strip() if bio else '',
                portfolio_url=portfolio_url if portfolio_url else None,
                motivation=motivation.strip(),
                cv_file=cv_file,
                status='pending'
            )
            
            logger.info(f'Solicitud de instructor creada: {application.id} para usuario {user.email}')
            
            return True, application, None
            
        except ValidationError as e:
            logger.error(f'Error de validación al crear solicitud de instructor: {str(e)}')
            return False, None, f'Error de validación: {str(e)}'
        except Exception as e:
            logger.error(f'Error al crear solicitud de instructor para {user.email}: {str(e)}', exc_info=True)
            return False, None, f'Error al crear solicitud: {str(e)}'
    
    def approve_application(
        self,
        application_id: int,
        admin_user
    ) -> Tuple[bool, Optional[InstructorApplication], str]:
        """
        Aprueba una solicitud de instructor
        
        Args:
            application_id: ID de la solicitud
            admin_user: Usuario administrador que aprueba
        
        Returns:
            Tuple[success, application, error_message]
        """
        try:
            # 1. Obtener la solicitud
            try:
                application = InstructorApplication.objects.get(id=application_id)
            except InstructorApplication.DoesNotExist:
                return False, None, "La solicitud no existe"
            
            # 2. Validar que esté pendiente
            if application.status != 'pending':
                return False, None, f"La solicitud ya fue {application.get_status_display().lower()}"
            
            # 3. Obtener o crear perfil del usuario
            try:
                profile = application.user.profile
            except UserProfile.DoesNotExist:
                profile = UserProfile.objects.create(user=application.user, role='student')
            
            # 4. Cambiar rol a instructor
            profile.role = 'instructor'
            profile.instructor_status = 'approved'
            profile.instructor_approved_by = admin_user
            profile.instructor_approved_at = timezone.now()
            profile.save()
            
            # 5. Actualizar solicitud
            application.status = 'approved'
            application.reviewed_by = admin_user
            application.reviewed_at = timezone.now()
            application.save()
            
            logger.info(f'Solicitud de instructor {application_id} aprobada por {admin_user.email}')
            
            return True, application, None
            
        except Exception as e:
            logger.error(f'Error al aprobar solicitud {application_id}: {str(e)}', exc_info=True)
            return False, None, f'Error al aprobar solicitud: {str(e)}'
    
    def reject_application(
        self,
        application_id: int,
        admin_user,
        rejection_reason: str = ''
    ) -> Tuple[bool, Optional[InstructorApplication], str]:
        """
        Rechaza una solicitud de instructor
        
        Args:
            application_id: ID de la solicitud
            admin_user: Usuario administrador que rechaza
            rejection_reason: Razón del rechazo
        
        Returns:
            Tuple[success, application, error_message]
        """
        try:
            # 1. Obtener la solicitud
            try:
                application = InstructorApplication.objects.get(id=application_id)
            except InstructorApplication.DoesNotExist:
                return False, None, "La solicitud no existe"
            
            # 2. Validar que esté pendiente
            if application.status != 'pending':
                return False, None, f"La solicitud ya fue {application.get_status_display().lower()}"
            
            # 3. Actualizar solicitud
            application.status = 'rejected'
            application.reviewed_by = admin_user
            application.reviewed_at = timezone.now()
            application.rejection_reason = rejection_reason.strip() if rejection_reason else 'Solicitud rechazada por el administrador'
            application.save()
            
            logger.info(f'Solicitud de instructor {application_id} rechazada por {admin_user.email}')
            
            return True, application, None
            
        except Exception as e:
            logger.error(f'Error al rechazar solicitud {application_id}: {str(e)}', exc_info=True)
            return False, None, f'Error al rechazar solicitud: {str(e)}'
    
    def get_user_application(self, user) -> Optional[InstructorApplication]:
        """
        Obtiene la solicitud más reciente de un usuario
        
        Args:
            user: Usuario
        
        Returns:
            InstructorApplication o None
        """
        try:
            return InstructorApplication.objects.filter(user=user).order_by('-created_at').first()
        except Exception as e:
            logger.error(f'Error al obtener solicitud de usuario {user.email}: {str(e)}')
            return None
    
    def can_reapply(self, user) -> Tuple[bool, Optional[int]]:
        """
        Verifica si un usuario puede volver a aplicar después de un rechazo
        
        Args:
            user: Usuario
        
        Returns:
            Tuple[can_reapply, days_remaining]
            - can_reapply: True si puede aplicar, False si no
            - days_remaining: Días que faltan para poder aplicar (None si puede aplicar ahora)
        """
        try:
            last_rejected = InstructorApplication.objects.filter(
                user=user,
                status='rejected'
            ).order_by('-reviewed_at').first()
            
            if not last_rejected or not last_rejected.reviewed_at:
                return True, None
            
            days_since_rejection = (timezone.now() - last_rejected.reviewed_at).days
            
            if days_since_rejection >= REAPPLY_COOLDOWN_DAYS:
                return True, None
            else:
                days_remaining = REAPPLY_COOLDOWN_DAYS - days_since_rejection
                return False, days_remaining
                
        except Exception as e:
            logger.error(f'Error al verificar si puede volver a aplicar para {user.email}: {str(e)}')
            return True, None  # En caso de error, permitir aplicar

