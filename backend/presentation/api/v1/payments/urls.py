"""
URLs de Pagos - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.payment_views import (
    create_payment_intent,
    process_payment,
    get_payment_intent,
    payment_webhook,
    tokenize_card,
    payment_history
)

urlpatterns = [
    path('intent/', create_payment_intent, name='create_payment_intent'),
    path('intent/<str:payment_intent_id>/', get_payment_intent, name='get_payment_intent'),
    path('tokenize/', tokenize_card, name='tokenize_card'),  # DEPRECATED: Usar CardPayment Brick en frontend
    path('process/', process_payment, name='process_payment'),
    path('webhook/', payment_webhook, name='payment_webhook'),
    path('history/', payment_history, name='payment_history'),
]

