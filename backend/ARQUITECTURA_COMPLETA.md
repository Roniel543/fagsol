# 🏗️ Arquitectura del Backend - FagSol Escuela Virtual

## 📋 **Estructura del Proyecto**

```
backend/
├── config/                    # Configuración de Django
│   ├── settings.py            # Configuración principal
│   ├── urls.py                # URLs principales
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/                      # Apps Django (para modelos)
│   ├── core/                  # App de perfiles de usuario
│   │   ├── models.py          # UserProfile (extiende Django User)
│   │   ├── admin.py           # Configuración del admin
│   │   └── apps.py            # Configuración de la app
│   ├── users/                 # App de usuarios (futuro)
│   ├── courses/               # App de cursos (futuro)
│   └── payments/              # App de pagos (futuro)
│
├── domain/                    # Capa de Dominio (Clean Architecture)
│   ├── entities/              # Entidades de negocio
│   ├── repositories/          # Interfaces de repositorios
│   └── services/              # Interfaces de servicios
│
├── application/                # Capa de Aplicación (Clean Architecture)
│   ├── use_cases/             # Casos de uso
│   ├── dtos/                  # Objetos de transferencia de datos
│   └── interfaces/            # Interfaces de casos de uso
│
├── infrastructure/            # Capa de Infraestructura (Clean Architecture)
│   ├── services/              # Implementaciones de servicios
│   │   └── auth_service.py    # Servicio de autenticación
│   └── repositories/          # Implementaciones de repositorios
│
└── presentation/              # Capa de Presentación (Clean Architecture)
    ├── api/v1/                # URLs de la API
    │   └── auth_urls.py       # URLs de autenticación
    └── views/                 # Vistas/Endpoints
        └── auth_views.py       # Endpoints de autenticación
```

---

## 🎯 **¿Cómo Funciona?**

### **1. Apps Django (`apps/`)**

Son apps **Django tradicionales** que contienen:
- ✅ **`models.py`**: Modelos de la base de datos (tablas)
- ✅ **`admin.py`**: Configuración del admin de Django
- ✅ **`apps.py`**: Configuración de la app

**Ejemplo: `apps/core/models.py`**
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    # ...
```

### **2. Clean Architecture (`domain/`, `application/`, `infrastructure/`, `presentation/`)**

Son **carpetas Python normales** (NO son apps Django) que organizan la lógica de negocio:

#### **📁 Domain (Dominio)**
- **Entidades**: Objetos de negocio puros (sin frameworks)
- **Repositories**: Interfaces para acceder a datos
- **Services**: Interfaces de servicios

#### **📁 Application (Aplicación)**
- **Use Cases**: Lógica de negocio específica
- **DTOs**: Objetos de transferencia de datos
- **Interfaces**: Contratos para servicios

#### **📁 Infrastructure (Infraestructura)**
- **Services**: Implementación de servicios (AuthService, etc.)
- **Repositories**: Implementación de repositorios (DB, APIs externas)

#### **📁 Presentation (Presentación)**
- **Views**: Endpoints REST (funciones que responden HTTP)
- **URLs**: Configuración de rutas de la API

---

## 🔄 **Flujo Completo: Login de Usuario**

### **1. Request HTTP**
```
POST http://localhost:8000/api/v1/login/
Body: { "email": "user@example.com", "password": "pass123" }
```

### **2. Routing (`config/urls.py`)**
```python
path('api/v1/', include('presentation.api.v1.auth_urls'))
```

### **3. URL de Auth (`presentation/api/v1/auth_urls.py`)**
```python
path('login/', login, name='auth_login')
```

### **4. View (`presentation/views/auth_views.py`)**
```python
@api_view(['POST'])
def login(request):
    # Recibe el request HTTP
    auth_service = AuthService()  # ← Inyección de dependencias
    result = auth_service.login(email, password)  # ← Llama al servicio
    return Response(result)  # ← Retorna JSON
```

### **5. Servicio (`infrastructure/services/auth_service.py`)**
```python
def login(self, email: str, password: str) -> dict:
    # Valida credenciales con Django
    user = authenticate(username=email, password=password)
    
    # Genera tokens JWT
    refresh = RefreshToken.for_user(user)
    
    # Retorna resultado
    return {
        'success': True,
        'user': {...},
        'tokens': {...}
    }
```

### **6. Modelo (`apps/core/models.py`)**
```python
# AuthService accede a:
User.objects.get(email=email)
UserProfile.objects.get(user=user)
```

### **7. Base de Datos**
```
PostgreSQL:
- auth_user table (Django)
- user_profiles table (nuestro modelo)
```

### **8. Response HTTP**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "student"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

## 🎨 **¿Qué va en cada lugar?**

### **📦 Apps Django (`apps/`)**
```python
# apps/core/models.py
class UserProfile(models.Model):
    user = models.OneToOneField(User)
    role = models.CharField(...)
```

### **🏛️ Domain (reglas de negocio puras)**
```python
# domain/entities/user.py
class User:
    def can_login(self) -> bool:
        return self.is_active and self.has_valid_password()
```

### **⚙️ Application (lógica de casos de uso)**
```python
# application/use_cases/login_use_case.py
class LoginUseCase:
    def execute(self, email, password):
        user = self.repository.find_by_email(email)
        if user.can_login():
            return self.auth_service.login(user)
```

### **🔧 Infrastructure (implementaciones)**
```python
# infrastructure/services/auth_service.py
class AuthService:
    def login(self, email, password):
        user = authenticate(username=email, password=password)
        return RefreshToken.for_user(user)
```

### **🌐 Presentation (API REST)**
```python
# presentation/views/auth_views.py
@api_view(['POST'])
def login(request):
    result = AuthService().login(email, password)
    return Response(result, status=200)
```

---

## 📌 **Ejemplo: Añadir un Nuevo Endpoint**

### **1. Crear el modelo (si es necesario)**
```python
# apps/courses/models.py
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
```

### **2. Crear el servicio**
```python
# infrastructure/services/course_service.py
class CourseService:
    def create_course(self, title, description):
        course = Course.objects.create(title=title, description=description)
        return course
```

### **3. Crear el endpoint**
```python
# presentation/views/course_views.py
@api_view(['POST'])
def create_course(request):
    service = CourseService()
    course = service.create_course(request.data['title'], request.data['description'])
    return Response({'course': course}, status=201)
```

### **4. Añadir la URL**
```python
# presentation/api/v1/course_urls.py
urlpatterns = [
    path('create/', create_course, name='create_course'),
]
```

### **5. Incluir en el router principal**
```python
# config/urls.py
path('api/v1/courses/', include('presentation.api.v1.course_urls')),
```

---

## ✅ **Resumen**

- **Apps Django** (`apps/`): Modelos y Admin (tablas de DB)
- **Domain**: Reglas de negocio puras
- **Application**: Casos de uso (lógica de negocio)
- **Infrastructure**: Implementaciones (servicios, repositorios)
- **Presentation**: API REST (endpoints)

---

## 🚀 **Estado Actual**

- ✅ Backend configurado
- ✅ Apps Django creadas (`core`, `users`, `courses`, `payments`)
- ✅ Endpoint de login funcionando
- ✅ Clean Architecture implementada
- ⏳ Frontend pendiente

---

## 📝 **Próximos Pasos**

1. Crear el frontend para login
2. Añadir más endpoints (registro, cursos, etc.)
3. Implementar más casos de uso
4. Añadir autenticación JWT completa

