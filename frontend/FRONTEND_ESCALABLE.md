# 🏗️ Frontend Escalable - FagSol Escuela Virtual

## 📋 **Nueva Estructura del Frontend**

```
frontend/src/
├── app/                          # Next.js App Router
│   ├── auth/                     # Rutas de autenticación
│   │   ├── login/page.tsx        # Página de login
│   │   └── register/page.tsx     # Página de registro
│   ├── dashboard/page.tsx        # Página del dashboard
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal (redirección)
│
├── features/                     # Funcionalidades por dominio
│   ├── auth/                     # Feature de autenticación
│   │   ├── components/           # Componentes específicos de auth
│   │   │   ├── LoginForm.tsx     # Formulario de login
│   │   │   └── RegisterForm.tsx  # Formulario de registro
│   │   └── pages/                # Páginas de auth
│   │       ├── LoginPage.tsx     # Página de login
│   │       └── RegisterPage.tsx  # Página de registro
│   │
│   └── dashboard/                # Feature del dashboard
│       ├── components/           # Componentes del dashboard
│       │   └── DashboardContent.tsx
│       └── pages/                # Páginas del dashboard
│           └── DashboardPage.tsx
│
└── shared/                       # Recursos compartidos
    ├── components/               # Componentes reutilizables
    │   └── index.tsx            # Button, Input, Select, Card, etc.
    ├── hooks/                    # Hooks compartidos
    │   └── useAuth.tsx          # Hook de autenticación
    ├── services/                # Servicios compartidos
    │   └── api.ts               # Configuración de API
    └── types/                    # Tipos TypeScript
        └── index.ts             # Interfaces y tipos
```

---

## 🎯 **Principios de la Arquitectura**

### **1. Feature-Based Organization**
- Cada funcionalidad tiene su propia carpeta
- Componentes, páginas y lógica agrupados por dominio
- Fácil de escalar y mantener

### **2. Shared Resources**
- Componentes reutilizables en `shared/components`
- Hooks compartidos en `shared/hooks`
- Servicios comunes en `shared/services`
- Tipos TypeScript en `shared/types`

### **3. Separation of Concerns**
- **Components**: UI pura
- **Pages**: Orquestación de componentes
- **Hooks**: Lógica de estado
- **Services**: Comunicación con API

---

## 📁 **¿Dónde va cada cosa?**

### **Nuevas Funcionalidades**
```bash
# Crear nueva feature (ejemplo: courses)
mkdir -p src/features/courses/{components,pages,hooks,services}

# Estructura:
src/features/courses/
├── components/
│   ├── CourseList.tsx
│   ├── CourseCard.tsx
│   └── CourseForm.tsx
├── pages/
│   ├── CoursesPage.tsx
│   └── CourseDetailPage.tsx
├── hooks/
│   └── useCourses.tsx
└── services/
    └── courseService.ts
```

### **Componentes Reutilizables**
```bash
# Añadir a shared/components/index.tsx
export function NewComponent() {
  // Componente reutilizable
}
```

### **Tipos TypeScript**
```bash
# Añadir a shared/types/index.ts
export interface NewType {
  // Definición de tipo
}
```

---

## 🔄 **Flujo de Desarrollo**

### **1. Crear Nueva Feature**
1. Crear estructura de carpetas
2. Definir tipos en `shared/types`
3. Crear servicios en `features/X/services`
4. Crear hooks en `features/X/hooks`
5. Crear componentes en `features/X/components`
6. Crear páginas en `features/X/pages`
7. Añadir rutas en `app/X/page.tsx`

### **2. Ejemplo: Feature de Cursos**
```typescript
// 1. Tipos
export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
}

// 2. Servicio
export const courseService = {
  getCourses: () => apiRequest('/courses/'),
  createCourse: (course: Course) => apiRequest('/courses/', { method: 'POST', body: JSON.stringify(course) }),
};

// 3. Hook
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  // Lógica del hook
  return { courses, setCourses };
}

// 4. Componente
export function CourseList({ courses }: { courses: Course[] }) {
  return (
    <div>
      {courses.map(course => <CourseCard key={course.id} course={course} />)}
    </div>
  );
}

// 5. Página
export default function CoursesPage() {
  const { courses } = useCourses();
  return <CourseList courses={courses} />;
}
```

---

## 🎨 **Componentes Compartidos**

### **Button**
```tsx
<Button variant="primary" size="md" loading={false}>
  Texto del botón
</Button>
```

### **Input**
```tsx
<Input
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  required
/>
```

### **Select**
```tsx
<Select
  label="Rol"
  name="role"
  value={role}
  onChange={handleChange}
  options={[{ value: 'student', label: 'Estudiante' }]}
/>
```

### **Card**
```tsx
<Card className="max-w-md">
  Contenido de la tarjeta
</Card>
```

---

## 🚀 **Ventajas de esta Estructura**

### **✅ Escalabilidad**
- Fácil añadir nuevas features
- Componentes reutilizables
- Separación clara de responsabilidades

### **✅ Mantenibilidad**
- Código organizado por dominio
- Fácil encontrar y modificar funcionalidades
- Tipos TypeScript para mayor seguridad

### **✅ Reutilización**
- Componentes compartidos
- Hooks reutilizables
- Servicios comunes

### **✅ Testing**
- Fácil testear componentes aislados
- Mocks simples para servicios
- Hooks testables independientemente

---

## 📝 **Próximos Pasos**

1. **Añadir más features**: courses, payments, users
2. **Mejorar componentes**: añadir más variantes
3. **Añadir validaciones**: formularios más robustos
4. **Implementar tests**: unit tests para componentes
5. **Añadir estado global**: Redux/Zustand si es necesario

---

## 🔧 **Comandos Útiles**

```bash
# Crear nueva feature
mkdir -p src/features/{feature-name}/{components,pages,hooks,services}

# Crear página
touch src/app/{route}/page.tsx

# Añadir componente
touch src/features/{feature}/components/{ComponentName}.tsx
```

---

## 📚 **Ejemplos de Uso**

### **Login**
```tsx
// src/app/auth/login/page.tsx
import LoginPage from '@/features/auth/pages/LoginPage';
export default function Page() {
  return <LoginPage />;
}
```

### **Dashboard**
```tsx
// src/app/dashboard/page.tsx
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
export default function Page() {
  return <DashboardPage />;
}
```

### **Hook de Auth**
```tsx
// En cualquier componente
const { user, login, logout, isAuthenticated } = useAuth();
```

---

¡Ahora el frontend es completamente escalable y organizado! 🎉
