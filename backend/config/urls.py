"""
URL Configuration for FagSol Escuela Virtual
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

def hola(request):
    return HttpResponse("Hola desde ruta principal")

urlpatterns = [
    #Ruta principal-Django
    path('',hola,name='hola'),
    # Django Admin
    path('admin/', admin.site.urls),
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API Routes - Arquitectura Limpia
    path('api/v1/', include('presentation.api.v1.auth_urls')),
]

# Configuración del Admin
admin.site.site_header = "FagSol Escuela Virtual - Administración"
admin.site.site_title = "FagSol Admin"
admin.site.index_title = "Panel de Administración"

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)