"""
Servicio de Pagos - FagSol Escuela Virtual
Integración con Mercado Pago
"""

import logging
import hashlib
import hmac
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import mercadopago
from apps.courses.models import Course
from apps.payments.models import PaymentIntent, Payment, PaymentWebhook
from apps.users.models import Enrollment

logger = logging.getLogger('apps')


class PaymentService:
    """
    Servicio de pagos que maneja la integración con Mercado Pago
    """
    
    def __init__(self):
        self.mp_access_token = settings.MERCADOPAGO_ACCESS_TOKEN
        self.mp_webhook_secret = settings.MERCADOPAGO_WEBHOOK_SECRET
        
        if self.mp_access_token:
            self.mp = mercadopago.SDK(self.mp_access_token)
        else:
            self.mp = None
            logger.warning("Mercado Pago Access Token no configurado")
    
    def create_payment_intent(
        self, 
        user, 
        course_ids: List[str],
        metadata: Optional[Dict] = None
    ) -> Tuple[bool, Optional[PaymentIntent], str]:
        """
        Crea un payment intent (intención de pago)
        
        Args:
            user: Usuario que está comprando
            course_ids: Lista de IDs de cursos a comprar
            metadata: Metadatos adicionales
        
        Returns:
            Tuple[success, payment_intent, error_message]
        """
        try:
            # 1. Validar que los cursos existen
            courses = Course.objects.filter(id__in=course_ids, is_active=True, status='published')
            if courses.count() != len(course_ids):
                return False, None, "Uno o más cursos no existen o no están disponibles"
            
            # 2. Validar que el usuario no tiene los cursos ya
            existing_enrollments = Enrollment.objects.filter(
                user=user,
                course_id__in=course_ids,
                status='active'
            ).values_list('course_id', flat=True)
            
            if existing_enrollments:
                return False, None, f"Ya estás inscrito en uno o más de estos cursos"
            
            # 3. Calcular total desde BD (NO confiar en el frontend)
            total = Decimal('0.00')
            for course in courses:
                total += course.price
            
            if total <= 0:
                return False, None, "El total debe ser mayor a 0"
            
            # 4. Crear payment intent
            payment_intent = PaymentIntent.objects.create(
                user=user,
                total=total,
                currency='PEN',
                course_ids=course_ids,
                status='pending',
                metadata=metadata or {},
                expires_at=timezone.now() + timedelta(hours=1)  # Expira en 1 hora
            )
            
            logger.info(f"Payment intent creado: {payment_intent.id} para usuario {user.id}")
            return True, payment_intent, ""
            
        except Exception as e:
            logger.error(f"Error al crear payment intent: {str(e)}")
            return False, None, f"Error al crear payment intent: {str(e)}"
    
    def tokenize_card(
        self,
        card_number: str,
        cardholder_name: str,
        expiration_month: str,
        expiration_year: str,
        security_code: str,
        identification_type: str = 'DNI',
        identification_number: str = '12345678'
    ) -> Tuple[bool, Optional[str], str]:
        """
        Tokeniza una tarjeta usando Mercado Pago API
        
        IMPORTANTE: Este método debe usarse SOLO desde el backend.
        El frontend NO debe enviar datos de tarjeta directamente.
        
        Args:
            card_number: Número de tarjeta (sin espacios)
            cardholder_name: Nombre del titular
            expiration_month: Mes de expiración (MM)
            expiration_year: Año de expiración (YY)
            security_code: CVV
            identification_type: Tipo de identificación (DNI, etc.)
            identification_number: Número de identificación
        
        Returns:
            Tuple[success, token, error_message]
        """
        try:
            if not self.mp:
                return False, None, "Mercado Pago no está configurado"
            
            # Limpiar número de tarjeta
            card_number = card_number.replace(' ', '').replace('-', '')
            
            # Preparar datos para tokenización
            card_data = {
                "card_number": card_number,
                "cardholder": {
                    "name": cardholder_name,
                },
                "card_expiration_month": expiration_month.zfill(2),
                "card_expiration_year": f"20{expiration_year}" if len(expiration_year) == 2 else expiration_year,
                "security_code": security_code,
                "identification_type": identification_type,
                "identification_number": identification_number,
            }
            
            # Tokenizar usando el SDK de Mercado Pago
            # El SDK maneja la llamada a la API con el access token
            token_result = self.mp.card_token().create(card_data)
            
            if token_result.get("status") == 201:
                token_id = token_result.get("response", {}).get("id")
                if token_id:
                    logger.info(f"Tarjeta tokenizada exitosamente")
                    return True, token_id, ""
                else:
                    return False, None, "No se pudo obtener el token de la respuesta"
            else:
                error_message = token_result.get("message", "Error desconocido al tokenizar")
                logger.error(f"Error al tokenizar tarjeta: {error_message}")
                return False, None, f"Error al tokenizar la tarjeta: {error_message}"
                
        except Exception as e:
            logger.error(f"Error al tokenizar tarjeta: {str(e)}")
            return False, None, f"Error al tokenizar la tarjeta: {str(e)}"
    
    def process_payment(
        self,
        user,
        payment_intent_id: str,
        payment_token: str,
        idempotency_key: Optional[str] = None
    ) -> Tuple[bool, Optional[Payment], str]:
        """
        Procesa un pago con Mercado Pago
        
        Args:
            user: Usuario que está pagando
            payment_intent_id: ID del payment intent
            payment_token: Token de Mercado Pago (tokenizado, NO datos de tarjeta)
            idempotency_key: Clave de idempotencia para evitar cobros duplicados
        
        Returns:
            Tuple[success, payment, error_message]
        """
        try:
            # 1. Obtener payment intent
            try:
                payment_intent = PaymentIntent.objects.get(id=payment_intent_id, user=user)
            except PaymentIntent.DoesNotExist:
                return False, None, "Payment intent no encontrado"
            
            # 2. Validar estado del payment intent
            if payment_intent.status != 'pending':
                return False, None, f"Payment intent ya fue procesado (estado: {payment_intent.status})"
            
            # 3. Validar expiración
            if payment_intent.expires_at and payment_intent.expires_at < timezone.now():
                payment_intent.status = 'cancelled'
                payment_intent.save()
                return False, None, "Payment intent expirado"
            
            # 4. Verificar idempotencia
            if idempotency_key:
                existing_payment = Payment.objects.filter(idempotency_key=idempotency_key).first()
                if existing_payment:
                    logger.warning(f"Intento de pago duplicado detectado: {idempotency_key}")
                    return False, None, "Este pago ya fue procesado"
            
            # 5. Actualizar payment intent a processing
            payment_intent.status = 'processing'
            payment_intent.save()
            
            # 6. Procesar pago con Mercado Pago
            if not self.mp:
                return False, None, "Mercado Pago no está configurado"
            
            # Crear preferencia de pago en Mercado Pago
            payment_data = {
                "transaction_amount": float(payment_intent.total),
                "token": payment_token,
                "description": f"Pago de cursos: {', '.join(payment_intent.course_ids)}",
                "installments": 1,
                "payment_method_id": "visa",  # Se detecta automáticamente del token
                "payer": {
                    "email": user.email,
                    "identification": {
                        "type": "DNI",
                        "number": "12345678"  # TODO: Obtener del perfil del usuario
                    }
                },
                "metadata": {
                    "payment_intent_id": payment_intent_id,
                    "user_id": user.id,
                    "course_ids": payment_intent.course_ids
                }
            }
            
            # Procesar pago
            payment_result = self.mp.payment().create(payment_data)
            
            # 7. Crear registro de pago
            payment = Payment.objects.create(
                payment_intent=payment_intent,
                user=user,
                amount=payment_intent.total,
                currency=payment_intent.currency,
                payment_token=payment_token,
                idempotency_key=idempotency_key,
                mercado_pago_payment_id=payment_result.get("response", {}).get("id"),
                mercado_pago_status=payment_result.get("response", {}).get("status"),
                mercado_pago_response=payment_result.get("response", {}),
                status='pending',
                metadata={}
            )
            
            # 8. Verificar resultado
            if payment_result.get("status") == 201:
                response_data = payment_result.get("response", {})
                payment_status = response_data.get("status")
                
                if payment_status == "approved":
                    payment.status = 'approved'
                    payment.save()
                    
                    # Actualizar payment intent
                    payment_intent.status = 'succeeded'
                    payment_intent.save()
                    
                    # Crear enrollments
                    self._create_enrollments(user, payment_intent.course_ids, payment)
                    
                    logger.info(f"Pago aprobado: {payment.id} para usuario {user.id}")
                    return True, payment, ""
                elif payment_status == "rejected":
                    payment.status = 'rejected'
                    payment.save()
                    payment_intent.status = 'failed'
                    payment_intent.save()
                    return False, payment, "Pago rechazado por Mercado Pago"
                else:
                    payment.status = 'pending'
                    payment.save()
                    return False, payment, f"Pago pendiente. Estado: {payment_status}"
            else:
                payment.status = 'rejected'
                payment.save()
                payment_intent.status = 'failed'
                payment_intent.save()
                error_message = payment_result.get("message", "Error desconocido")
                logger.error(f"Error en pago Mercado Pago: {error_message}")
                return False, payment, f"Error al procesar pago: {error_message}"
                
        except Exception as e:
            logger.error(f"Error al procesar pago: {str(e)}")
            if payment_intent:
                payment_intent.status = 'failed'
                payment_intent.save()
            return False, None, f"Error al procesar pago: {str(e)}"
    
    def _create_enrollments(self, user, course_ids: List[str], payment):
        """
        Crea enrollments después de un pago exitoso
        """
        try:
            enrollments = []
            for course_id in course_ids:
                enrollment = Enrollment.objects.create(
                    user=user,
                    course_id=course_id,
                    payment=payment,
                    status='active',
                    completed=False
                )
                enrollments.append(enrollment)
            
            logger.info(f"Enrollments creados: {len(enrollments)} para usuario {user.id}")
            return enrollments
        except Exception as e:
            logger.error(f"Error al crear enrollments: {str(e)}")
            raise
    
    def verify_webhook_signature(self, x_signature: str, x_request_id: str, data_id: str) -> bool:
        """
        Verifica la firma del webhook de Mercado Pago
        
        Args:
            x_signature: Firma del webhook
            x_request_id: ID de la request
            data_id: ID de los datos
        
        Returns:
            True si la firma es válida
        """
        try:
            if not self.mp_webhook_secret:
                logger.warning("Webhook secret no configurado, no se puede verificar firma")
                return True  # En desarrollo, permitir sin verificación
            
            # Construir string a verificar
            parts = x_signature.split(',')
            ts = None
            hash_value = None
            
            for part in parts:
                if part.startswith('ts='):
                    ts = part.split('=')[1]
                elif part.startswith('v1='):
                    hash_value = part.split('=')[1]
            
            if not ts or not hash_value:
                return False
            
            # Crear string a hashear
            data_string = f"id:{data_id};request-id:{x_request_id};ts:{ts};"
            
            # Calcular HMAC
            expected_hash = hmac.new(
                self.mp_webhook_secret.encode(),
                data_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(hash_value, expected_hash)
            
        except Exception as e:
            logger.error(f"Error al verificar firma de webhook: {str(e)}")
            return False
    
    def process_webhook(self, webhook_data: Dict) -> Tuple[bool, str]:
        """
        Procesa un webhook de Mercado Pago
        
        Args:
            webhook_data: Datos del webhook
        
        Returns:
            Tuple[success, error_message]
        """
        try:
            # Obtener ID del webhook
            webhook_id = webhook_data.get("id")
            if not webhook_id:
                return False, "ID de webhook no encontrado"
            
            # Verificar si ya fue procesado
            existing_webhook = PaymentWebhook.objects.filter(mercado_pago_id=webhook_id).first()
            if existing_webhook and existing_webhook.processed:
                logger.info(f"Webhook ya procesado: {webhook_id}")
                return True, ""
            
            # Crear registro de webhook
            webhook = PaymentWebhook.objects.create(
                mercado_pago_id=webhook_id,
                event_type=webhook_data.get("type", "unknown"),
                payment_id=webhook_data.get("data", {}).get("id"),
                data=webhook_data
            )
            
            # Procesar según tipo de evento
            event_type = webhook_data.get("type")
            if event_type == "payment":
                payment_data = webhook_data.get("data", {})
                payment_id = payment_data.get("id")
                
                # Buscar pago por ID de Mercado Pago
                payment = Payment.objects.filter(mercado_pago_payment_id=payment_id).first()
                if payment:
                    # Actualizar estado del pago
                    mp_status = payment_data.get("status")
                    if mp_status == "approved" and payment.status != "approved":
                        payment.status = "approved"
                        payment.mercado_pago_status = mp_status
                        payment.save()
                        
                        # Actualizar payment intent
                        if payment.payment_intent:
                            payment.payment_intent.status = "succeeded"
                            payment.payment_intent.save()
                        
                        # Crear enrollments si no existen
                        if not Enrollment.objects.filter(payment=payment).exists():
                            self._create_enrollments(
                                payment.user,
                                payment.payment_intent.course_ids,
                                payment
                            )
                    
                    webhook.processed = True
                    webhook.processed_at = timezone.now()
                    webhook.save()
                    
                    logger.info(f"Webhook procesado: {webhook_id}")
                    return True, ""
                else:
                    webhook.error_message = f"Pago no encontrado: {payment_id}"
                    webhook.save()
                    return False, f"Pago no encontrado: {payment_id}"
            else:
                webhook.processed = True
                webhook.processed_at = timezone.now()
                webhook.save()
                logger.info(f"Webhook de tipo desconocido procesado: {event_type}")
                return True, ""
                
        except Exception as e:
            logger.error(f"Error al procesar webhook: {str(e)}")
            return False, f"Error al procesar webhook: {str(e)}"
