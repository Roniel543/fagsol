"""
Implementaciones de repositorios - FagSol Escuela Virtual

Estos repositorios implementan las interfaces del dominio usando Django ORM
"""

from typing import List, Optional
from datetime import datetime
from django.db import transaction
from ..database.models import User as UserModel, Course as CourseModel, Module as ModuleModel, Enrollment as EnrollmentModel, Payment as PaymentModel
from ...domain.entities import User, Course, Module, Enrollment, Payment, UserRole, CourseLevel, PaymentStatus
from ...domain.repositories import UserRepository, CourseRepository, ModuleRepository, EnrollmentRepository, PaymentRepository


class DjangoUserRepository(UserRepository):
    """
    Implementación del repositorio de usuarios usando Django ORM
    """
    
    def save(self, user: User) -> User:
        """Guarda un usuario"""
        with transaction.atomic():
            if user.id:
                # Actualizar usuario existente
                user_model = UserModel.objects.get(id=user.id)
                user_model.email = user.email
                user_model.first_name = user.first_name
                user_model.last_name = user.last_name
                user_model.role = user.role.value
                user_model.is_active = user.is_active
                user_model.phone = user.phone
                user_model.avatar = user.avatar
                user_model.bio = user.bio
                user_model.is_email_verified = user.is_email_verified
                user_model.last_login = user.last_login
                user_model.save()
            else:
                # Crear nuevo usuario
                user_model = UserModel.objects.create(
                    email=user.email,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    role=user.role.value,
                    is_active=user.is_active,
                    phone=user.phone,
                    avatar=user.avatar,
                    bio=user.bio,
                    is_email_verified=user.is_email_verified,
                    last_login=user.last_login
                )
            
            return self._model_to_entity(user_model)

    def find_by_id(self, user_id: int) -> Optional[User]:
        """Busca un usuario por ID"""
        try:
            user_model = UserModel.objects.get(id=user_id)
            return self._model_to_entity(user_model)
        except UserModel.DoesNotExist:
            return None

    def find_by_email(self, email: str) -> Optional[User]:
        """Busca un usuario por email"""
        try:
            user_model = UserModel.objects.get(email=email)
            return self._model_to_entity(user_model)
        except UserModel.DoesNotExist:
            return None

    def find_all(self, limit: int = 100, offset: int = 0) -> List[User]:
        """Obtiene todos los usuarios con paginación"""
        user_models = UserModel.objects.all()[offset:offset + limit]
        return [self._model_to_entity(user_model) for user_model in user_models]

    def delete(self, user_id: int) -> bool:
        """Elimina un usuario"""
        try:
            user_model = UserModel.objects.get(id=user_id)
            user_model.delete()
            return True
        except UserModel.DoesNotExist:
            return False

    def _model_to_entity(self, user_model: UserModel) -> User:
        """Convierte un modelo de Django a una entidad del dominio"""
        return User(
            id=user_model.id,
            email=user_model.email,
            first_name=user_model.first_name,
            last_name=user_model.last_name,
            role=UserRole(user_model.role),
            is_active=user_model.is_active,
            phone=user_model.phone,
            avatar=user_model.avatar,
            bio=user_model.bio,
            is_email_verified=user_model.is_email_verified,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
            last_login=user_model.last_login
        )


class DjangoCourseRepository(CourseRepository):
    """
    Implementación del repositorio de cursos usando Django ORM
    """
    
    def save(self, course: Course) -> Course:
        """Guarda un curso"""
        with transaction.atomic():
            if course.id:
                # Actualizar curso existente
                course_model = CourseModel.objects.get(id=course.id)
                course_model.title = course.title
                course_model.slug = course.slug
                course_model.description = course.description
                course_model.instructor_id = course.instructor_id
                course_model.level = course.level.value
                course_model.duration_hours = course.duration_hours
                course_model.full_price = course.full_price
                course_model.discount_percentage = course.discount_percentage
                course_model.is_active = course.is_active
                course_model.short_description = course.short_description
                course_model.image = course.image
                course_model.requirements = course.requirements
                course_model.what_you_learn = course.what_you_learn
                course_model.target_audience = course.target_audience
                course_model.total_students = course.total_students
                course_model.modules_count = course.modules_count
                course_model.save()
            else:
                # Crear nuevo curso
                course_model = CourseModel.objects.create(
                    title=course.title,
                    slug=course.slug,
                    description=course.description,
                    instructor_id=course.instructor_id,
                    level=course.level.value,
                    duration_hours=course.duration_hours,
                    full_price=course.full_price,
                    discount_percentage=course.discount_percentage,
                    is_active=course.is_active,
                    short_description=course.short_description,
                    image=course.image,
                    requirements=course.requirements,
                    what_you_learn=course.what_you_learn,
                    target_audience=course.target_audience,
                    total_students=course.total_students,
                    modules_count=course.modules_count
                )
            
            return self._model_to_entity(course_model)

    def find_by_id(self, course_id: int) -> Optional[Course]:
        """Busca un curso por ID"""
        try:
            course_model = CourseModel.objects.get(id=course_id)
            return self._model_to_entity(course_model)
        except CourseModel.DoesNotExist:
            return None

    def find_by_slug(self, slug: str) -> Optional[Course]:
        """Busca un curso por slug"""
        try:
            course_model = CourseModel.objects.get(slug=slug)
            return self._model_to_entity(course_model)
        except CourseModel.DoesNotExist:
            return None

    def find_all(self, limit: int = 100, offset: int = 0) -> List[Course]:
        """Obtiene todos los cursos con paginación"""
        course_models = CourseModel.objects.all()[offset:offset + limit]
        return [self._model_to_entity(course_model) for course_model in course_models]

    def find_by_instructor(self, instructor_id: int) -> List[Course]:
        """Busca cursos por instructor"""
        course_models = CourseModel.objects.filter(instructor_id=instructor_id)
        return [self._model_to_entity(course_model) for course_model in course_models]

    def delete(self, course_id: int) -> bool:
        """Elimina un curso"""
        try:
            course_model = CourseModel.objects.get(id=course_id)
            course_model.delete()
            return True
        except CourseModel.DoesNotExist:
            return False

    def _model_to_entity(self, course_model: CourseModel) -> Course:
        """Convierte un modelo de Django a una entidad del dominio"""
        return Course(
            id=course_model.id,
            title=course_model.title,
            slug=course_model.slug,
            description=course_model.description,
            instructor_id=course_model.instructor_id,
            level=CourseLevel(course_model.level),
            duration_hours=course_model.duration_hours,
            full_price=float(course_model.full_price),
            discount_percentage=course_model.discount_percentage,
            is_active=course_model.is_active,
            short_description=course_model.short_description,
            image=course_model.image,
            requirements=course_model.requirements,
            what_you_learn=course_model.what_you_learn,
            target_audience=course_model.target_audience,
            total_students=course_model.total_students,
            modules_count=course_model.modules_count,
            created_at=course_model.created_at,
            updated_at=course_model.updated_at
        )
