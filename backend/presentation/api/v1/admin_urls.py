"""
URLs de administración - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.admin_views import (
    list_groups,
    list_permissions,
    get_user_permissions,
    assign_permission_to_user,
    remove_permission_from_user,
    assign_user_to_group,
    remove_user_from_group,
    list_pending_instructors,
    list_all_instructors,
    approve_instructor,
    reject_instructor,
    list_pending_courses,
    list_all_courses_admin,
    approve_course,
    reject_course,
    list_instructor_applications,
    approve_instructor_application,
    reject_instructor_application,
    # Gestión de usuarios (CRUD)
    list_users,
    get_user_detail,
    create_user,
    update_user,
    delete_user,
    activate_user,
    deactivate_user,
    # Gestión de módulos
    list_course_modules,
    create_module,
    update_module,
    delete_module,
    # Gestión de lecciones
    list_module_lessons,
    create_lesson,
    update_lesson,
    delete_lesson,
    # Gestión de materiales
    list_course_materials,
    create_material,
    update_material,
    delete_material,
    # Gestión de alumnos inscritos
    list_course_students,
    get_student_progress,
    get_course_status_counts,
)

urlpatterns = [
    # Grupos
    path('groups/', list_groups, name='admin_list_groups'),
    
    # Permisos
    path('permissions/', list_permissions, name='admin_list_permissions'),
    
    # Permisos de usuarios
    path('users/<int:user_id>/permissions/', get_user_permissions, name='admin_get_user_permissions'),
    path('users/<int:user_id>/permissions/assign/', assign_permission_to_user, name='admin_assign_permission'),
    path('users/<int:user_id>/permissions/<int:permission_id>/', remove_permission_from_user, name='admin_remove_permission'),
    
    # Grupos de usuarios
    path('users/<int:user_id>/groups/assign/', assign_user_to_group, name='admin_assign_user_to_group'),
    path('users/<int:user_id>/groups/<int:group_id>/', remove_user_from_group, name='admin_remove_user_from_group'),
    
    # Aprobación de instructores 
    path('instructors/pending/', list_pending_instructors, name='admin_list_pending_instructors'),
    path('instructors/', list_all_instructors, name='admin_list_all_instructors'),
    path('instructors/<int:instructor_id>/approve/', approve_instructor, name='admin_approve_instructor'),
    path('instructors/<int:instructor_id>/reject/', reject_instructor, name='admin_reject_instructor'),
    
    # Aprobación de cursos
    path('courses/pending/', list_pending_courses, name='admin_list_pending_courses'),
    path('courses/status-counts/', get_course_status_counts, name='admin_course_status_counts'),
    path('courses/', list_all_courses_admin, name='admin_list_all_courses'),
    path('courses/<str:course_id>/approve/', approve_course, name='admin_approve_course'),
    path('courses/<str:course_id>/reject/', reject_course, name='admin_reject_course'),
    
    # Gestión de solicitudes de instructor
    path('instructor-applications/', list_instructor_applications, name='admin_list_instructor_applications'),
    path('instructor-applications/<int:id>/approve/', approve_instructor_application, name='admin_approve_instructor_application'),
    path('instructor-applications/<int:id>/reject/', reject_instructor_application, name='admin_reject_instructor_application'),
    
    # Gestión de usuarios (CRUD)
    path('users/', list_users, name='admin_list_users'),
    path('users/<int:user_id>/', get_user_detail, name='admin_get_user_detail'),
    path('users/create/', create_user, name='admin_create_user'),  # POST /admin/users/create/
    path('users/<int:user_id>/update/', update_user, name='admin_update_user'),  # PUT /admin/users/{id}/update/
    path('users/<int:user_id>/delete/', delete_user, name='admin_delete_user'),  # DELETE /admin/users/{id}/delete/
    path('users/<int:user_id>/activate/', activate_user, name='admin_activate_user'),
    path('users/<int:user_id>/deactivate/', deactivate_user, name='admin_deactivate_user'),
    
    # Gestión de módulos
    path('courses/<str:course_id>/modules/', list_course_modules, name='admin_list_course_modules'),
    path('courses/<str:course_id>/modules/create/', create_module, name='admin_create_module'),
    path('modules/<str:module_id>/update/', update_module, name='admin_update_module'),
    path('modules/<str:module_id>/delete/', delete_module, name='admin_delete_module'),
    
    # Gestión de lecciones
    path('modules/<str:module_id>/lessons/', list_module_lessons, name='admin_list_module_lessons'),
    path('modules/<str:module_id>/lessons/create/', create_lesson, name='admin_create_lesson'),
    path('lessons/<str:lesson_id>/update/', update_lesson, name='admin_update_lesson'),
    path('lessons/<str:lesson_id>/delete/', delete_lesson, name='admin_delete_lesson'),
    
    # Gestión de materiales
    path('courses/<str:course_id>/materials/', list_course_materials, name='admin_list_course_materials'),
    path('courses/<str:course_id>/materials/create/', create_material, name='admin_create_material'),
    path('materials/<str:material_id>/update/', update_material, name='admin_update_material'),
    path('materials/<str:material_id>/delete/', delete_material, name='admin_delete_material'),
    
    # Gestión de alumnos inscritos
    path('courses/<str:course_id>/students/', list_course_students, name='admin_list_course_students'),
    path('courses/<str:course_id>/students/<str:enrollment_id>/progress/', get_student_progress, name='admin_get_student_progress'),
]

