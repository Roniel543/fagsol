"""
Servicio de Pagos - FagSol Escuela Virtual
Integración con Mercado Pago
"""

import logging
import hashlib
import hmac
import requests
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import mercadopago
from apps.courses.models import Course
from apps.payments.models import PaymentIntent, Payment, PaymentWebhook
from apps.users.models import Enrollment
from infrastructure.external_services import DjangoEmailService

logger = logging.getLogger('apps')


def get_user_friendly_error_message(status_detail: str) -> str:
    """
    Traduce códigos de error de Mercado Pago a mensajes amigables para el usuario
    """
    error_messages = {
        'cc_rejected_other_reason': 'Tu tarjeta fue rechazada. Por favor, verifica los datos o intenta con otra tarjeta.',
        'cc_rejected_call_for_authorize': 'Necesitas autorizar este pago. Por favor, contacta a tu banco.',
        'cc_rejected_card_disabled': 'Tu tarjeta está deshabilitada. Por favor, contacta a tu banco.',
        'cc_rejected_insufficient_amount': 'Fondos insuficientes en tu tarjeta.',
        'cc_rejected_bad_filled_card_number': 'El número de tarjeta es incorrecto.',
        'cc_rejected_bad_filled_date': 'La fecha de vencimiento es incorrecta.',
        'cc_rejected_bad_filled_other': 'Algunos datos de la tarjeta son incorrectos.',
        'cc_rejected_bad_filled_security_code': 'El código de seguridad (CVV) es incorrecto.',
        'cc_rejected_high_risk': 'El pago fue rechazado por medidas de seguridad.',
        'cc_rejected_max_attempts': 'Has excedido el número máximo de intentos. Intenta más tarde.',
        'cc_rejected_card_error': 'Error al procesar tu tarjeta. Intenta nuevamente.',
        'cc_rejected_duplicated_payment': 'Ya existe un pago con estos datos.',
        'cc_rejected_invalid_installments': 'El número de cuotas no es válido.',
        'cc_rejected_fraud': 'El pago fue rechazado por medidas de seguridad.',
    }
    
    # Si tenemos un mensaje específico, usarlo; si no, devolver un mensaje genérico
    return error_messages.get(status_detail, f'Tu pago fue rechazado. Razón: {status_detail}')


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
    
    def _infer_payment_method_id(self, card_number: str) -> str:
        """
        Infiere el payment_method_id basándose en el BIN (primeros dígitos) de la tarjeta
        
        Args:
            card_number: Número de tarjeta (sin espacios)
            
        Returns:
            payment_method_id (ej: "visa", "master", "amex", etc.)
        """
        # Limpiar número de tarjeta
        card_number = card_number.replace(' ', '').replace('-', '')
        
        if not card_number or len(card_number) < 6:
            return "visa"  # Valor por defecto
        
        # Obtener BIN (primeros 6 dígitos)
        bin_number = card_number[:6]
        first_digit = bin_number[0]
        
        # Inferir payment_method_id basándose en el BIN
        if first_digit == '4':
            return "visa"
        elif first_digit == '5' or (first_digit == '2' and len(bin_number) >= 2 and bin_number[1] in ['2', '3', '4', '5', '6', '7']):
            return "master"
        elif first_digit == '3':
            return "amex"
        elif first_digit == '6':
            return "diners"
        else:
            return "visa"  # Valor por defecto
    
    def tokenize_card(
        self,
        card_number: str,
        cardholder_name: str,
        expiration_month: str,
        expiration_year: str,
        security_code: str,
        identification_type: str = 'DNI',
        identification_number: str = '12345678'
    ) -> Tuple[bool, Optional[str], Optional[str], str]:
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
                response_data = token_result.get("response", {})
                token_id = response_data.get("id")
                payment_method_id_from_token = response_data.get("payment_method_id")  # Ej: "visa", "master", etc.
                
                # Si el token no devuelve payment_method_id, inferirlo del número de tarjeta
                if not payment_method_id_from_token:
                    payment_method_id_from_token = self._infer_payment_method_id(card_number)
                
                if token_id:
                    logger.info(f"Tarjeta tokenizada exitosamente. Token: {token_id[:20]}..., Payment Method: {payment_method_id_from_token}")
                    # Retornar token y payment_method_id
                    return True, token_id, payment_method_id_from_token, ""
                else:
                    return False, None, None, "No se pudo obtener el token de la respuesta"
            else:
                error_message = token_result.get("message", "Error desconocido al tokenizar")
                logger.error(f"Error al tokenizar tarjeta: {error_message}")
                return False, None, None, f"Error al tokenizar la tarjeta: {error_message}"
                
        except Exception as e:
            logger.error(f"Error al tokenizar tarjeta: {str(e)}")
            return False, None, None, f"Error al tokenizar la tarjeta: {str(e)}"
    
    def process_payment(
        self,
        user,
        payment_intent_id: str,
        payment_token: str,
        payment_method_id: str,
        installments: int,
        amount: Decimal,
        idempotency_key: Optional[str] = None
    ) -> Tuple[bool, Optional[Payment], str]:
        """
        Procesa un pago con Mercado Pago usando token de CardPayment Brick
        
        IMPORTANTE: Solo acepta token, payment_method_id, installments, amount.
        NO acepta datos de tarjeta (card_number, expiration_month, expiration_year, security_code).
        
        Campos enviados a Mercado Pago:
        - token (obligatorio) - obtenido de CardPayment Brick
        - transaction_amount (obligatorio) - validado contra payment_intent.total desde DB
        - installments (obligatorio)
        - payment_method_id (obligatorio - debe venir del token)
        - payer.email (obligatorio)
        - payer.identification (obligatorio)
        
        NO se envían: expiration_month, expiration_year, card_number, security_code
        
        Args:
            user: Usuario que está pagando
            payment_intent_id: ID del payment intent
            payment_token: Token de Mercado Pago (obtenido de CardPayment Brick)
            payment_method_id: Payment method ID (ej: "visa", "master")
            installments: Número de cuotas
            amount: Monto del pago (será validado contra payment_intent.total desde DB)
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
            
            # 4. VALIDAR AMOUNT contra DB (NO confiar en frontend)
            # Convertir amount a Decimal para comparación precisa
            amount_decimal = Decimal(str(amount))
            if amount_decimal != payment_intent.total:
                logger.warning(
                    f"Amount mismatch: frontend={amount_decimal}, db={payment_intent.total}, "
                    f"payment_intent_id={payment_intent_id}, user_id={user.id}"
                )
                return False, None, f"El monto enviado ({amount_decimal}) no coincide con el monto calculado ({payment_intent.total})"
            
            # 5. Verificar idempotencia
            if idempotency_key:
                existing_payment = Payment.objects.filter(idempotency_key=idempotency_key).first()
                if existing_payment:
                    logger.warning(f"Intento de pago duplicado detectado: {idempotency_key}")
                    return False, None, "Este pago ya fue procesado"
            
            # 6. Actualizar payment intent a processing
            payment_intent.status = 'processing'
            payment_intent.save()
            
            # 7. Procesar pago con Mercado Pago
            if not self.mp:
                return False, None, "Mercado Pago no está configurado"
            
            # Validar que el token existe
            if not payment_token:
                payment_intent.status = 'failed'
                payment_intent.save()
                return False, None, "token es requerido"
            
            # Validar payment_method_id (REQUERIDO cuando se usa token)
            if not payment_method_id:
                logger.warning("⚠️ payment_method_id NO proporcionado. Esto puede causar error 'diff_param_bins'")
            else:
                logger.info(f"Usando payment_method_id del token: {payment_method_id}")
            
            # Validar installments
            if installments < 1:
                payment_intent.status = 'failed'
                payment_intent.save()
                return False, None, "El número de cuotas debe ser al menos 1"
            
            # Preparar datos para Mercado Pago
            # IMPORTANTE: Cuando se usa un TOKEN de CardPayment Brick, Mercado Pago NO acepta expiration_month ni expiration_year.
            # El token ya contiene TODA la información de la tarjeta, incluyendo fecha de expiración.
            # 
            # Según la documentación oficial de Mercado Pago 2024-2025:
            # Campos REQUERIDOS cuando se usa token:
            # - token (obligatorio) - obtenido de CardPayment Brick
            # - transaction_amount (obligatorio) - validado contra DB
            # - installments (obligatorio) - recibido del frontend
            # - payment_method_id (obligatorio - debe venir del token)
            # - payer.email (obligatorio)
            # - payer.identification (obligatorio)
            #
            # NO incluir: expiration_month, expiration_year, card_expiration_month, card_expiration_year
            # NO incluir: card_number, security_code (están en el token)
            payment_data = {
                "transaction_amount": float(payment_intent.total),  # Usar total de DB, no del frontend
                "token": payment_token,  # Token obtenido de CardPayment Brick
                "description": f"Pago de cursos: {', '.join(payment_intent.course_ids)}",
                "installments": installments,  # Usar installments recibido del frontend
                "payment_method_id": payment_method_id,  # REQUERIDO cuando se usa token
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
            
            logger.info(f"Payment method ID usado: {payment_method_id}")
            logger.info(f"Installments: {installments}")
            
            # Loggear datos antes de enviar (sin token completo por seguridad)
            logger.info(f"Procesando pago. Payment Intent: {payment_intent_id}, Amount: {payment_intent.total}, Token: {payment_token[:20]}...")
            logger.info(f"Payment data keys: {list(payment_data.keys())}")
            logger.info(f"Payment data (sin token): { {k: v for k, v in payment_data.items() if k != 'token'} }")
            
            # Procesar pago usando el SDK de Mercado Pago
            # El SDK maneja correctamente los tokens y la estructura del payload
            try:
                logger.info(f"Enviando pago a Mercado Pago usando SDK...")
                payment_result = self.mp.payment().create(payment_data)
                
                # El SDK retorna un dict con 'status' y 'response'
                if not isinstance(payment_result, dict):
                    # Si el SDK retorna algo diferente, intentar con API REST como fallback
                    logger.warning("SDK retornó formato inesperado, intentando con API REST...")
                    headers = {
                        "Authorization": f"Bearer {self.mp_access_token}",
                        "Content-Type": "application/json",
                        "X-Idempotency-Key": idempotency_key or f"{payment_intent_id}_{int(timezone.now().timestamp())}"
                    }
                    response = requests.post(
                        "https://api.mercadopago.com/v1/payments",
                        json=payment_data,
                        headers=headers,
                        timeout=30
                    )
                    payment_result = {
                        "status": response.status_code,
                        "response": response.json() if response.content else {}
                    }
                    logger.info(f"Respuesta de API REST (fallback): Status {response.status_code}")
                else:
                    logger.info(f"Respuesta de SDK: Status {payment_result.get('status')}")
                
                # Validar que payment_result no sea None
                if payment_result is None:
                    logger.error("Mercado Pago retornó None")
                    payment_intent.status = 'failed'
                    payment_intent.save()
                    return False, None, "Error al procesar pago: Mercado Pago no retornó respuesta"
                
                logger.info(f"Respuesta de Mercado Pago recibida. Status: {payment_result.get('status') if isinstance(payment_result, dict) else 'N/A'}, Tipo: {type(payment_result)}")
                logger.info(f"Respuesta completa de Mercado Pago: {payment_result}")
            except Exception as mp_error:
                logger.error(f"Excepción al llamar a Mercado Pago: {str(mp_error)}")
                logger.error(f"Tipo de error: {type(mp_error)}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                payment_intent.status = 'failed'
                payment_intent.save()
                return False, None, f"Error al procesar pago: {str(mp_error)}"
            
            # 7. Verificar resultado ANTES de crear el registro de pago
            if payment_result.get("status") == 201:
                response_data = payment_result.get("response", {})
                payment_status = response_data.get("status")
                
                # Crear registro de pago solo si la respuesta es exitosa
                payment = Payment.objects.create(
                    payment_intent=payment_intent,
                    user=user,
                    amount=payment_intent.total,  # Usar total de DB
                    currency=payment_intent.currency,
                    payment_token=payment_token,
                    installments=installments,  # Guardar installments
                    idempotency_key=idempotency_key,
                    mercado_pago_payment_id=response_data.get("id"),
                    mercado_pago_status=payment_status,
                    mercado_pago_response=response_data,
                    status='pending',
                    metadata={}
                )
                
                if payment_status == "approved":
                    payment.status = 'approved'
                    payment.save()
                    
                    # Actualizar payment intent
                    payment_intent.status = 'succeeded'
                    payment_intent.save()
                    
                    # Crear enrollments y obtener nombres de cursos
                    enrollments, course_names = self._create_enrollments(user, payment_intent.course_ids, payment)
                    
                    # Enviar email de confirmación de pago (en background, no bloquea la respuesta)
                    try:
                        email_service = DjangoEmailService()
                        user_name = user.get_full_name() or user.username or user.email.split('@')[0]
                        email_service.send_payment_success_email(
                            user_email=user.email,
                            user_name=user_name,
                            payment_id=payment.id,
                            amount=float(payment.amount),
                            currency=payment.currency,
                            course_names=course_names
                        )
                        logger.info(f"Email de confirmación de pago enviado a {user.email}")
                    except Exception as email_error:
                        # No fallar el pago si el email falla, solo loguear
                        logger.error(f"Error al enviar email de confirmación de pago: {str(email_error)}")
                    
                    logger.info(f"Pago aprobado: {payment.id} para usuario {user.id}")
                    return True, payment, ""
                elif payment_status == "rejected":
                    payment.status = 'rejected'
                    payment.save()
                    payment_intent.status = 'failed'
                    payment_intent.save()
                    # Extraer mensaje de rechazo si está disponible
                    status_detail = response_data.get("status_detail", "cc_rejected_other_reason")
                    # Traducir código de error a mensaje amigable
                    user_message = get_user_friendly_error_message(status_detail)
                    logger.warning(f"Pago rechazado: {status_detail} para usuario {user.id}, Payment Intent: {payment_intent_id}")
                    return False, payment, user_message
                else:
                    payment.status = 'pending'
                    payment.save()
                    return False, payment, f"Pago pendiente. Estado: {payment_status}"
            else:
                # Error en la creación del pago - extraer mensaje de error detallado
                error_message = "Error desconocido"
                
                # Intentar extraer mensaje de diferentes estructuras posibles
                if "message" in payment_result:
                    error_message = payment_result.get("message")
                elif "error" in payment_result:
                    error_data = payment_result.get("error")
                    if isinstance(error_data, str):
                        error_message = error_data
                    elif isinstance(error_data, dict):
                        error_message = error_data.get("message", str(error_data))
                elif "response" in payment_result:
                    response_data = payment_result.get("response", {})
                    if "message" in response_data:
                        error_message = response_data.get("message")
                    elif "cause" in response_data:
                        causes = response_data.get("cause", [])
                        if causes and len(causes) > 0:
                            error_message = causes[0].get("description", "Error en el pago")
                
                # Loggear respuesta completa para debugging
                logger.error(f"Error en pago Mercado Pago. Status: {payment_result.get('status')}, Respuesta completa: {payment_result}")
                
                # Actualizar payment intent a failed
                payment_intent.status = 'failed'
                payment_intent.save()
                
                return False, None, f"Error al procesar pago: {error_message}"
                
        except Exception as e:
            import traceback
            logger.error(f"Excepción al procesar pago: {str(e)}")
            logger.error(f"Tipo de excepción: {type(e)}")
            logger.error(f"Traceback completo: {traceback.format_exc()}")
            if payment_intent:
                payment_intent.status = 'failed'
                payment_intent.save()
            return False, None, f"Error al procesar pago: {str(e)}"
    
    def _create_enrollments(self, user, course_ids: List[str], payment):
        """
        Crea enrollments después de un pago exitoso
        
        Returns:
            Tuple[enrollments, course_names]: Lista de enrollments creados y nombres de cursos
        """
        try:
            enrollments = []
            course_names = []
            
            for course_id in course_ids:
                # Obtener curso para obtener el nombre
                try:
                    course = Course.objects.get(id=course_id)
                    course_names.append(course.title)
                except Course.DoesNotExist:
                    logger.warning(f"Curso {course_id} no encontrado, usando ID como nombre")
                    course_names.append(f"Curso {course_id}")
                
                enrollment = Enrollment.objects.create(
                    user=user,
                    course_id=course_id,
                    payment=payment,
                    status='active',
                    completed=False
                )
                enrollments.append(enrollment)
            
            logger.info(f"Enrollments creados: {len(enrollments)} para usuario {user.id}")
            return enrollments, course_names
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
