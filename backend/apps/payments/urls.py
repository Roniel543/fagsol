"""
URLs for payments app
"""
from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('create-preference/', views.CreatePaymentPreferenceView.as_view(), name='create-preference'),
    path('webhook/', views.MercadoPagoWebhookView.as_view(), name='webhook'),
    path('my-payments/', views.MyPaymentsView.as_view(), name='my-payments'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
]

