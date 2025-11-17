"""
Servicio de Aprobación de Instructores - FagSol Escuela Virtual
FASE 1: Sistema de aprobación de instructores

Este servicio maneja la lógica de negocio para aprobar/rechazar instructores.
"""

import logging
from typing import Tuple, Optional, Dict, Any
from django.contrib.auth.models import User
from django.utils import timezone
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_INSTRUCTOR, is_admin

logger = logging.getLogger('apps')


class InstructorApprovalService:
    """
    Servicio para gestionar la aprobación de instructores
    """
    
    def approve_instructor(
        self,
        admin_user: User,
        instructor_user_id: int,
        notes: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Aprueba un instructor pendiente
        
        Args:
            admin_user: Usuario administrador que realiza la aprobación
            instructor_user_id: ID del usuario instructor a aprobar
            notes: Notas opcionales sobre la aprobación
            
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # 1. Validar que el usuario que aprueba es admin
            if not is_admin(admin_user):
                return False, None, "Solo los administradores pueden aprobar instructores"
            
            # 2. Obtener el instructor
            try:
                instructor_user = User.objects.get(id=instructor_user_id)
            except User.DoesNotExist:
                return False, None, "Usuario instructor no encontrado"
            
            # 3. Verificar que tiene perfil
            try:
                profile = instructor_user.profile
            except UserProfile.DoesNotExist:
                return False, None, "El usuario no tiene perfil asociado"
            
            # 4. Validar que es instructor
            if profile.role != ROLE_INSTRUCTOR:
                return False, None, "El usuario no es un instructor"
            
            # 5. Validar estado actual
            if profile.instructor_status == 'approved':
                return False, None, "El instructor ya está aprobado"
            
            if profile.instructor_status == 'rejected':
                # Permitir re-aprobar un instructor rechazado
                logger.info(f"Re-aprobando instructor {instructor_user_id} que fue rechazado previamente")
            
            # 6. Aprobar instructor
            profile.instructor_status = 'approved'
            profile.instructor_approved_by = admin_user
            profile.instructor_approved_at = timezone.now()
            profile.instructor_rejection_reason = None  # Limpiar razón de rechazo si existe
            profile.save()
            
            # 7. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) aprobó instructor "
                f"{instructor_user_id} ({instructor_user.email})"
            )
            
            # 8. Retornar datos
            return True, {
                'instructor': {
                    'id': instructor_user.id,
                    'email': instructor_user.email,
                    'first_name': instructor_user.first_name,
                    'last_name': instructor_user.last_name,
                    'role': profile.role,
                    'instructor_status': profile.instructor_status,
                    'approved_by': {
                        'id': admin_user.id,
                        'email': admin_user.email
                    },
                    'approved_at': profile.instructor_approved_at.isoformat()
                }
            }, ""
            
        except Exception as e:
            logger.error(f"Error aprobando instructor {instructor_user_id}: {str(e)}")
            return False, None, f"Error interno al aprobar instructor: {str(e)}"
    
    def reject_instructor(
        self,
        admin_user: User,
        instructor_user_id: int,
        rejection_reason: str
    ) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Rechaza un instructor pendiente
        
        Args:
            admin_user: Usuario administrador que realiza el rechazo
            instructor_user_id: ID del usuario instructor a rechazar
            rejection_reason: Razón del rechazo (requerida)
            
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # 1. Validar que el usuario que rechaza es admin
            if not is_admin(admin_user):
                return False, None, "Solo los administradores pueden rechazar instructores"
            
            # 2. Validar razón de rechazo
            if not rejection_reason or not rejection_reason.strip():
                return False, None, "La razón de rechazo es requerida"
            
            # Sanitizar razón de rechazo (prevenir XSS)
            rejection_reason = rejection_reason.strip()[:1000]  # Limitar longitud
            
            # 3. Obtener el instructor
            try:
                instructor_user = User.objects.get(id=instructor_user_id)
            except User.DoesNotExist:
                return False, None, "Usuario instructor no encontrado"
            
            # 4. Verificar que tiene perfil
            try:
                profile = instructor_user.profile
            except UserProfile.DoesNotExist:
                return False, None, "El usuario no tiene perfil asociado"
            
            # 5. Validar que es instructor
            if profile.role != ROLE_INSTRUCTOR:
                return False, None, "El usuario no es un instructor"
            
            # 6. Validar estado actual
            if profile.instructor_status == 'rejected':
                return False, None, "El instructor ya está rechazado"
            
            # 7. Rechazar instructor
            profile.instructor_status = 'rejected'
            profile.instructor_rejection_reason = rejection_reason
            profile.instructor_approved_by = None
            profile.instructor_approved_at = None
            profile.save()
            
            # 8. Log de auditoría
            logger.info(
                f"Admin {admin_user.id} ({admin_user.email}) rechazó instructor "
                f"{instructor_user_id} ({instructor_user.email}). Razón: {rejection_reason[:100]}"
            )
            
            # 9. Retornar datos
            return True, {
                'instructor': {
                    'id': instructor_user.id,
                    'email': instructor_user.email,
                    'first_name': instructor_user.first_name,
                    'last_name': instructor_user.last_name,
                    'role': profile.role,
                    'instructor_status': profile.instructor_status,
                    'rejection_reason': profile.instructor_rejection_reason
                }
            }, ""
            
        except Exception as e:
            logger.error(f"Error rechazando instructor {instructor_user_id}: {str(e)}")
            return False, None, f"Error interno al rechazar instructor: {str(e)}"
    
    def get_pending_instructors(self) -> Tuple[bool, list, str]:
        """
        Obtiene la lista de instructores pendientes de aprobación
        
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # Obtener instructores pendientes
            pending_profiles = UserProfile.objects.filter(
                role=ROLE_INSTRUCTOR,
                instructor_status='pending_approval'
            ).select_related('user').order_by('-created_at')
            
            instructors_data = []
            for profile in pending_profiles:
                instructors_data.append({
                    'id': profile.user.id,
                    'email': profile.user.email,
                    'first_name': profile.user.first_name,
                    'last_name': profile.user.last_name,
                    'role': profile.role,
                    'instructor_status': profile.instructor_status,
                    'created_at': profile.created_at.isoformat(),
                    'phone': profile.phone,
                    'is_email_verified': profile.is_email_verified
                })
            
            return True, instructors_data, ""
            
        except Exception as e:
            logger.error(f"Error obteniendo instructores pendientes: {str(e)}")
            return False, [], f"Error interno al obtener instructores pendientes: {str(e)}"
    
    def get_all_instructors(self, status_filter: Optional[str] = None) -> Tuple[bool, list, str]:
        """
        Obtiene todos los instructores con filtro opcional por estado
        
        Args:
            status_filter: Filtro opcional ('pending_approval', 'approved', 'rejected')
            
        Returns:
            Tuple[success, data, error_message]
        """
        try:
            # Query base
            queryset = UserProfile.objects.filter(
                role=ROLE_INSTRUCTOR
            ).select_related('user', 'instructor_approved_by')
            
            # Aplicar filtro si existe
            if status_filter:
                queryset = queryset.filter(instructor_status=status_filter)
            
            queryset = queryset.order_by('-created_at')
            
            instructors_data = []
            for profile in queryset:
                instructor_data = {
                    'id': profile.user.id,
                    'email': profile.user.email,
                    'first_name': profile.user.first_name,
                    'last_name': profile.user.last_name,
                    'role': profile.role,
                    'instructor_status': profile.instructor_status,
                    'created_at': profile.created_at.isoformat(),
                    'phone': profile.phone,
                    'is_email_verified': profile.is_email_verified
                }
                
                # Agregar información de aprobación si está aprobado
                if profile.instructor_status == 'approved' and profile.instructor_approved_by:
                    instructor_data['approved_by'] = {
                        'id': profile.instructor_approved_by.id,
                        'email': profile.instructor_approved_by.email
                    }
                    if profile.instructor_approved_at:
                        instructor_data['approved_at'] = profile.instructor_approved_at.isoformat()
                
                # Agregar razón de rechazo si está rechazado
                if profile.instructor_status == 'rejected' and profile.instructor_rejection_reason:
                    instructor_data['rejection_reason'] = profile.instructor_rejection_reason
                
                instructors_data.append(instructor_data)
            
            return True, instructors_data, ""
            
        except Exception as e:
            logger.error(f"Error obteniendo instructores: {str(e)}")
            return False, [], f"Error interno al obtener instructores: {str(e)}"

