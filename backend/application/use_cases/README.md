# 📋 Casos de Uso - FagSol Escuela Virtual

**Ubicación:** `backend/application/use_cases/`

---

## 🎯 Propósito

Esta carpeta contiene la **lógica de negocio** de la aplicación organizada en casos de uso. Cada caso de uso representa una operación específica del sistema y encapsula la lógica de negocio independiente de la infraestructura.

---

## 📁 Estructura

```
application/use_cases/
├── auth/                    # Autenticación
│   ├── __init__.py
│   ├── login_use_case.py
│   ├── register_use_case.py
│   └── password_reset_use_case.py
│
├── course/                  # Cursos
│   ├── __init__.py
│   ├── create_course_use_case.py
│   ├── update_course_use_case.py
│   ├── delete_course_use_case.py
│   ├── approve_course_use_case.py
│   └── reject_course_use_case.py
│
├── dashboard/              # Dashboard
│   ├── __init__.py
│   ├── get_admin_stats_use_case.py
│   ├── get_instructor_stats_use_case.py
│   └── get_student_stats_use_case.py
│
├── instructor/             # Instructores
│   ├── __init__.py
│   ├── create_application_use_case.py
│   ├── get_application_use_case.py
│   ├── approve_instructor_use_case.py
│   └── reject_instructor_use_case.py
│
└── lesson/                 # Lecciones
    ├── __init__.py
    ├── mark_lesson_completed_use_case.py
    └── get_progress_use_case.py
```

---

## 🏗️ Patrón de Caso de Uso

Cada caso de uso sigue este patrón:

```python
from typing import Optional
from dataclasses import dataclass

@dataclass
class UseCaseResult:
    """Resultado de un caso de uso"""
    success: bool
    data: Optional[dict] = None
    error_message: Optional[str] = None


class LoginUseCase:
    """
    Caso de uso: Login de usuario
    
    Responsabilidades:
    - Validar credenciales
    - Generar tokens JWT
    - Retornar resultado
    """
    
    def __init__(self, auth_repository, token_service):
        """
        Inyección de dependencias:
        - auth_repository: Repositorio de autenticación
        - token_service: Servicio de tokens
        """
        self.auth_repository = auth_repository
        self.token_service = token_service
    
    def execute(self, email: str, password: str) -> UseCaseResult:
        """
        Ejecuta el caso de uso
        
        Args:
            email: Email del usuario
            password: Contraseña del usuario
            
        Returns:
            UseCaseResult con el resultado de la operación
        """
        try:
            # 1. Validar credenciales
            user = self.auth_repository.find_by_email(email)
            if not user or not user.check_password(password):
                return UseCaseResult(
                    success=False,
                    error_message="Credenciales inválidas"
                )
            
            # 2. Generar tokens
            tokens = self.token_service.generate_tokens(user)
            
            # 3. Retornar resultado
            return UseCaseResult(
                success=True,
                data={
                    'user': user,
                    'tokens': tokens
                }
            )
        except Exception as e:
            return UseCaseResult(
                success=False,
                error_message=f"Error en login: {str(e)}"
            )
```

---

## 🔄 Flujo de Datos

```
Presentation Layer (Views)
    ↓
Application Layer (Use Cases) ← Estamos aquí
    ↓
Domain Layer (Entities, Rules)
    ↓
Infrastructure Layer (Repositories, External Services)
    ↓
Database / External APIs
```

---

## ✅ Principios

1. **Single Responsibility**: Cada caso de uso tiene una responsabilidad única
2. **Dependency Injection**: Las dependencias se inyectan por constructor
3. **Testabilidad**: Fácil de testear con mocks
4. **Independencia**: No depende de frameworks específicos

---

## 📝 Convenciones

### **Nombres:**
- Archivos: `snake_case.py`
- Clases: `PascalCase` + `UseCase` (ej: `LoginUseCase`)
- Métodos: `execute()` para el método principal

### **Estructura:**
- Cada caso de uso en su propio archivo
- Resultado tipado con `UseCaseResult` o similar
- Manejo de errores explícito

---

## 🚀 Próximos Pasos

Ver [Plan de Reorganización](../../../docs/architecture/PLAN_REORGANIZACION_SERVICIOS.md) para:
- Migración de servicios existentes
- Implementación de casos de uso
- Actualización de views

---

**Última actualización:** 2025-01-27

