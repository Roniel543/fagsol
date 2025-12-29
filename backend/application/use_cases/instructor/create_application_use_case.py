"""
Caso de uso: Crear solicitud de instructor - FagSol Escuela Virtual
"""

import logging
from typing import Optional
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from apps.core.models import InstructorApplication, UserProfile

logger = logging.getLogger('apps')

# Días que deben pasar antes de poder volver a aplicar después de un rechazo
REAPPLY_COOLDOWN_DAYS = 30


class CreateApplicationUseCase:
    """
    Caso de uso: Crear solicitud de instructor
    
    Responsabilidades:
    - Validar que el usuario no sea ya instructor
    - Validar que no tenga solicitud pendiente
    - Validar tiempo de espera si hubo rechazo reciente
    - Validar campos requeridos
    - Crear solicitud
    """
    
    def execute(
        self,
        user,
        professional_title: str = '',
        experience_years: int = 0,
        specialization: str = '',
        bio: str = '',
        portfolio_url: str = '',
        motivation: str = '',
        cv_file=None
    ) -> 'UseCaseResult':
        """
        Ejecuta el caso de uso de crear solicitud de instructor
        
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
            UseCaseResult con el resultado de la operación
        """
        from application.dtos.use_case_result import UseCaseResult
        
        try:
            # 1. Validar que el usuario no sea ya instructor
            try:
                profile = user.profile
                if profile.role == 'instructor':
                    return UseCaseResult(
                        success=False,
                        error_message="Ya eres instructor. No necesitas solicitar nuevamente."
                    )
            except UserProfile.DoesNotExist:
                profile = UserProfile.objects.create(user=user, role='student')
            
            # 2. Validar que no tenga una solicitud pendiente
            pending_application = InstructorApplication.objects.filter(
                user=user,
                status='pending'
            ).first()
            
            if pending_application:
                return UseCaseResult(
                    success=False,
                    error_message="Ya tienes una solicitud pendiente. Espera a que sea revisada."
                )
            
            # 3. Validar tiempo de espera si hubo un rechazo reciente
            last_rejected = InstructorApplication.objects.filter(
                user=user,
                status='rejected'
            ).order_by('-reviewed_at').first()
            
            if last_rejected and last_rejected.reviewed_at:
                days_since_rejection = (timezone.now() - last_rejected.reviewed_at).days
                if days_since_rejection < REAPPLY_COOLDOWN_DAYS:
                    days_remaining = REAPPLY_COOLDOWN_DAYS - days_since_rejection
                    return UseCaseResult(
                        success=False,
                        error_message=f"Debes esperar {days_remaining} día(s) más antes de volver a aplicar. Tu última solicitud fue rechazada hace {days_since_rejection} día(s)."
                    )
            
            # 4. Validar campos requeridos
            if not motivation or not motivation.strip():
                return UseCaseResult(
                    success=False,
                    error_message="La motivación es requerida. Cuéntanos por qué quieres ser instructor."
                )
            
            # 5. Validar años de experiencia
            if experience_years < 0:
                experience_years = 0
            
            # 6. Validar URL del portfolio si se proporciona
            if portfolio_url and portfolio_url.strip():
                portfolio_url = portfolio_url.strip()
                if not portfolio_url.startswith(('http://', 'https://')):
                    return UseCaseResult(
                        success=False,
                        error_message="La URL del portfolio debe comenzar con http:// o https://"
                    )
            
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
            
            return UseCaseResult(
                success=True,
                data={
                    'id': application.id,
                    'status': application.status,
                    'created_at': application.created_at.isoformat()
                },
                extra={'application': application}
            )
            
        except ValidationError as e:
            logger.error(f'Error de validación al crear solicitud de instructor: {str(e)}')
            from application.dtos.use_case_result import UseCaseResult
            return UseCaseResult(
                success=False,
                error_message=f'Error de validación: {str(e)}'
            )
        except Exception as e:
            logger.error(f'Error al crear solicitud de instructor para {user.email}: {str(e)}', exc_info=True)
            from application.dtos.use_case_result import UseCaseResult
            return UseCaseResult(
                success=False,
                error_message=f'Error al crear solicitud: {str(e)}'
            )

