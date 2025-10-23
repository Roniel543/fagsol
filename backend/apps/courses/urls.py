"""
URLs for courses app
"""
from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    # Courses
    path('', views.CourseListView.as_view(), name='course-list'),
    path('<slug:slug>/', views.CourseDetailView.as_view(), name='course-detail'),
    
    # Modules
    path('<slug:course_slug>/modules/', views.ModuleListView.as_view(), name='module-list'),
    path('<slug:course_slug>/modules/<slug:module_slug>/', views.ModuleDetailView.as_view(), name='module-detail'),
    
    # Lessons
    path('modules/<int:module_id>/lessons/', views.LessonListView.as_view(), name='lesson-list'),
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    
    # Enrollments
    path('my-enrollments/', views.MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('enrollments/<int:pk>/', views.EnrollmentDetailView.as_view(), name='enrollment-detail'),
    
    # Progress
    path('lessons/<int:lesson_id>/progress/', views.UpdateLessonProgressView.as_view(), name='lesson-progress'),
    path('lessons/<int:lesson_id>/complete/', views.CompleteLessonView.as_view(), name='complete-lesson'),
]

