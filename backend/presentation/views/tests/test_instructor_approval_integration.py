"""
Tests de Integración para Endpoints de Aprobación de Instructores - FagSol Escuela Virtual
FASE 1: Sistema de aprobación de instructores
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import UserProfile
from apps.users.permissions import ROLE_INSTRUCTOR, ROLE_ADMIN, ROLE_STUDENT


class InstructorApprovalIntegrationTestCase(TestCase):
    """Tests de integración para endpoints de aprobación de instructores"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        self.base_url = '/api/v1/admin'
        
        # Crear admin
        self.admin_user = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User'
        )
        UserProfile.objects.create(user=self.admin_user, role=ROLE_ADMIN)
        
        # Token para admin
        refresh = RefreshToken.for_user(self.admin_user)
        self.admin_token = str(refresh.access_token)
        
        # Crear instructor pendiente
        self.pending_instructor = User.objects.create_user(
            username='instructor@test.com',
            email='instructor@test.com',
            password='testpass123',
            first_name='Instructor',
            last_name='Pending'
        )
        UserProfile.objects.create(
            user=self.pending_instructor,
            role=ROLE_INSTRUCTOR,
            instructor_status='pending_approval'
        )
        
        # Crear estudiante (no admin)
        self.student_user = User.objects.create_user(
            username='student@test.com',
            email='student@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=self.student_user, role=ROLE_STUDENT)
        
        # Token para estudiante
        refresh_student = RefreshToken.for_user(self.student_user)
        self.student_token = str(refresh_student.access_token)
    
    def test_list_pending_instructors_success(self):
        """Test: Admin puede listar instructores pendientes"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        response = self.client.get(f'{self.base_url}/instructors/pending/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        self.assertIn('count', response.data)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['id'], self.pending_instructor.id)
        self.assertEqual(response.data['data'][0]['instructor_status'], 'pending_approval')
    
    def test_list_pending_instructors_unauthorized(self):
        """Test: No admin no puede listar instructores pendientes"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        
        response = self.client.get(f'{self.base_url}/instructors/pending/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_list_pending_instructors_unauthenticated(self):
        """Test: Usuario no autenticado no puede listar"""
        response = self.client.get(f'{self.base_url}/instructors/pending/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_all_instructors_success(self):
        """Test: Admin puede listar todos los instructores"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        response = self.client.get(f'{self.base_url}/instructors/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        self.assertGreaterEqual(response.data['count'], 1)
    
    def test_list_all_instructors_with_filter(self):
        """Test: Admin puede filtrar instructores por estado"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        response = self.client.get(f'{self.base_url}/instructors/?status=pending_approval')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['instructor_status'], 'pending_approval')
    
    def test_approve_instructor_success(self):
        """Test: Admin puede aprobar instructor"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        response = self.client.post(
            f'{self.base_url}/instructors/{self.pending_instructor.id}/approve/',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['instructor']['instructor_status'], 'approved')
        
        # Verificar en BD
        profile = UserProfile.objects.get(user=self.pending_instructor)
        self.assertEqual(profile.instructor_status, 'approved')
        self.assertEqual(profile.instructor_approved_by, self.admin_user)
    
    def test_approve_instructor_unauthorized(self):
        """Test: No admin no puede aprobar"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        
        response = self.client.post(
            f'{self.base_url}/instructors/{self.pending_instructor.id}/approve/',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_approve_instructor_not_found(self):
        """Test: Error si instructor no existe"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        response = self.client.post(
            f'{self.base_url}/instructors/99999/approve/',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
    
    def test_reject_instructor_success(self):
        """Test: Admin puede rechazar instructor"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        rejection_reason = "No cumple con los requisitos mínimos"
        response = self.client.post(
            f'{self.base_url}/instructors/{self.pending_instructor.id}/reject/',
            {'rejection_reason': rejection_reason},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['instructor']['instructor_status'], 'rejected')
        
        # Verificar en BD
        profile = UserProfile.objects.get(user=self.pending_instructor)
        self.assertEqual(profile.instructor_status, 'rejected')
        self.assertEqual(profile.instructor_rejection_reason, rejection_reason)
    
    def test_reject_instructor_missing_reason(self):
        """Test: Error si falta razón de rechazo"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        response = self.client.post(
            f'{self.base_url}/instructors/{self.pending_instructor.id}/reject/',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('requerida', response.data['message'])
    
    def test_reject_instructor_unauthorized(self):
        """Test: No admin no puede rechazar"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        
        response = self.client.post(
            f'{self.base_url}/instructors/{self.pending_instructor.id}/reject/',
            {'rejection_reason': 'Razón'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_approve_instructor_with_notes(self):
        """Test: Aprobar instructor con notas opcionales"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        response = self.client.post(
            f'{self.base_url}/instructors/{self.pending_instructor.id}/approve/',
            {'notes': 'Instructor con experiencia comprobada'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

