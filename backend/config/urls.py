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
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Schema view para Swagger (configurado aquí para evitar importaciones circulares)
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="FagSol Escuela Virtual API",
        default_version='v1',
        description="""
        API REST para FagSol Escuela Virtual - Plataforma educativa en línea.
        
        ## Autenticación
        Esta API usa JWT (JSON Web Tokens) para autenticación. Para usar los endpoints protegidos:
        1. Obtén un token usando `/api/v1/login/`
        2. Haz clic en "Authorize" (🔓) arriba a la derecha
        3. Pega el token CON "Bearer " al inicio: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
        4. Haz clic en "Authorize" y cierra
        
        ## Seguridad
        - Todos los endpoints validan y sanitizan las entradas
        - Los precios se validan solo en el backend
        - Los pagos usan tokenización (no se almacenan datos de tarjeta)
        - Los certificados usan URLs firmadas expirables
        
        ## Roles
        - **admin**: Acceso completo al sistema
        - **instructor**: Puede ver/editar cursos
        - **student**: Puede ver cursos publicados y sus propios recursos
        - **guest**: Solo puede ver cursos publicados
        """,
        terms_of_service="https://fagsol.com/terms/",
        contact=openapi.Contact(
            name="FagSol S.A.C.",
            email="soporte@fagsol.com"
        ),
        license=openapi.License(name="Propietario - FagSol S.A.C."),
    ),
    public=True,  # Permitir acceso público a la documentación (solo lectura)
    permission_classes=[permissions.AllowAny],  # Sin restricciones para ver la documentación
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
    path('api/v1/auth/', include('presentation.api.v1.auth_urls')),
    path('api/v1/admin/', include('presentation.api.v1.admin_urls')),
    path('api/v1/dashboard/', include('presentation.api.v1.dashboard.urls')),
    path('api/v1/payments/', include('presentation.api.v1.payments.urls')),
    path('api/v1/courses/', include('presentation.api.v1.courses.urls')),
    path('api/v1/enrollments/', include('presentation.api.v1.enrollments.urls')),
    path('api/v1/certificates/', include('presentation.api.v1.certificates.urls')),
    path('api/v1/progress/', include('presentation.api.v1.progress.urls')),
    
    # OpenAPI/Swagger Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Configuración del Admin
admin.site.site_header = "FagSol Escuela Virtual - Administración"
admin.site.site_title = "FagSol Admin"
admin.site.index_title = "Panel de Administración"

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)