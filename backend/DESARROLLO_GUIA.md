# 📚 Guía de Desarrollo - FagSol

## 🎯 **Para Desarrolladores**

### **¿Dónde pongo cada cosa?**

#### **1. Modelos de Base de Datos**
```python
# ✅ DENTRO DE: apps/core/models.py, apps/courses/models.py, etc.

# Ejemplo: apps/courses/models.py
from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'courses'
```

#### **2. Admin de Django**
```python
# ✅ DENTRO DE: apps/core/admin.py, apps/courses/admin.py, etc.

# Ejemplo: apps/courses/admin.py
from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'created_at']
```

#### **3. Servicios (Lógica de Negocio)**
```python
# ✅ DENTRO DE: infrastructure/services/

# Ejemplo: infrastructure/services/course_service.py
class CourseService:
    def create_course(self, title: str, description: str):
        course = Course.objects.create(
            title=title,
            description=description
        )
        return course
    
    def get_course(self, course_id: int):
        return Course.objects.get(id=course_id)
```

#### **4. Endpoints (API REST)**
```python
# ✅ DENTRO DE: presentation/views/

# Ejemplo: presentation/views/course_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from infrastructure.services.course_service import CourseService

@api_view(['POST'])
@permission_classes([AllowAny])
def create_course(request):
    service = CourseService()
    course = service.create_course(
        request.data['title'],
        request.data['description']
    )
    return Response({'course': course}, status=status.HTTP_201_CREATED)
```

#### **5. URLs de la API**
```python
# ✅ DENTRO DE: presentation/api/v1/

# Ejemplo: presentation/api/v1/course_urls.py
from django.urls import path
from presentation.views.course_views import create_course, get_course

urlpatterns = [
    path('create/', create_course, name='create_course'),
    path('<int:course_id>/', get_course, name='get_course'),
]
```

#### **6. Registrar URLs en config**
```python
# ✅ DENTRO DE: config/urls.py

# Añadir al final de urlpatterns:
urlpatterns = [
    # ...
    path('api/v1/courses/', include('presentation.api.v1.course_urls')),
]
```

---

## 🔄 **Flujo de Desarrollo Típico**

### **Caso: Añadir Funcionalidad de Cursos**

#### **Paso 1: Modelo**
```python
# apps/courses/models.py
class Course(models.Model):
    title = models.CharField(max_length=200)
    # ...
```

#### **Paso 2: Admin**
```python
# apps/courses/admin.py
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    # ...
```

#### **Paso 3: Servicio**
```python
# infrastructure/services/course_service.py
class CourseService:
    def create_course(self, ...):
        # Lógica de negocio
        pass
```

#### **Paso 4: View**
```python
# presentation/views/course_views.py
@api_view(['POST'])
def create_course(request):
    service = CourseService()
    result = service.create_course(...)
    return Response(result)
```

#### **Paso 5: URL**
```python
# presentation/api/v1/course_urls.py
urlpatterns = [
    path('create/', create_course),
]
```

#### **Paso 6: Incluir en config**
```python
# config/urls.py
path('api/v1/courses/', include('presentation.api.v1.course_urls')),
```

#### **Paso 7: Migraciones**
```bash
python manage.py makemigrations courses
python manage.py migrate
```

---

## 📁 **Estructura de Archivos Actual**

```
backend/
├── apps/
│   ├── core/
│   │   ├── models.py       # ✅ UserProfile
│   │   └── admin.py        # ✅ Admin de UserProfile
│   ├── users/              # ⏳ Futuro
│   ├── courses/             # ⏳ Futuro
│   └── payments/           # ⏳ Futuro
│
├── infrastructure/
│   └── services/
│       └── auth_service.py  # ✅ AuthService
│
├── presentation/
│   ├── api/v1/
│   │   └── auth_urls.py    # ✅ URLs de auth
│   └── views/
│       └── auth_views.py    # ✅ Endpoints de auth
│
└── config/
    ├── settings.py          # ✅ Configuración
    └── urls.py              # ✅ URLs principales
```

---

## 🎯 **Endpoints Disponibles**

### **Auth**
- `POST /api/v1/login/` - Login
- `POST /api/v1/register/` - Registro
- `GET  /api/v1/health/` - Health check

### **Admin**
- `GET  /admin/` - Django Admin

---

## 📝 **Comandos Útiles**

```bash
# Verificar que todo funciona
python manage.py check

# Crear migraciones
python manage.py makemigrations core

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

---

## ✅ **Checklist para Nuevas Funcionalidades**

- [ ] Crear modelo en `apps/X/models.py`
- [ ] Configurar admin en `apps/X/admin.py`
- [ ] Crear servicio en `infrastructure/services/`
- [ ] Crear view en `presentation/views/`
- [ ] Crear URLs en `presentation/api/v1/`
- [ ] Incluir URLs en `config/urls.py`
- [ ] Crear migraciones: `python manage.py makemigrations`
- [ ] Aplicar migraciones: `python manage.py migrate`
- [ ] Probar con Postman/curl

