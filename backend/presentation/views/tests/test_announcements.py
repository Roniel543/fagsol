"""
Tests de integración para Anuncios/Convocatorias - FagSol Escuela Virtual

- GET /api/v1/announcements/active/ es público y devuelve el anuncio activo o null.
- Admin: GET/POST /api/v1/announcements/, PATCH /api/v1/announcements/<id>/.
- IDOR: usuario no admin no puede listar/crear/actualizar anuncios.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.core.models import UserProfile
from apps.announcements.models import Announcement
from django.utils import timezone


class AnnouncementsPublicTestCase(TestCase):
    """GET /active/ público."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/v1/announcements/active/'

    def test_get_active_returns_null_when_no_announcement(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIsNone(response.data['data'])

    def test_get_active_returns_visible_announcement(self):
        Announcement.objects.create(
            slug='test-1',
            title='Test',
            summary='Summary',
            active=True,
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIsNotNone(response.data['data'])
        self.assertEqual(response.data['data']['slug'], 'test-1')
        self.assertEqual(response.data['data']['title'], 'Test')
        self.assertEqual(response.data['data']['summary'], 'Summary')

    def test_get_active_does_not_return_inactive(self):
        Announcement.objects.create(
            slug='inactive-1',
            title='Inactive',
            active=False,
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIsNone(response.data['data'])

    def test_get_active_respects_dates(self):
        now = timezone.now()
        future = now + timezone.timedelta(days=1)
        Announcement.objects.create(
            slug='future-1',
            title='Future',
            active=True,
            starts_at=future,
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['data'])


class AnnouncementsAdminTestCase(TestCase):
    """Admin: list, create, update. Solo rol admin."""

    def setUp(self):
        self.client = APIClient()
        self.base = '/api/v1/announcements'
        self.admin_user = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com',
            password='testpass123',
        )
        UserProfile.objects.create(user=self.admin_user, role='admin')
        self.student_user = User.objects.create_user(
            username='student@test.com',
            email='student@test.com',
            password='testpass123',
        )
        UserProfile.objects.create(user=self.student_user, role='student')

    def test_list_announcements_requires_admin(self):
        response = self.client.get(f'{self.base}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(f'{self.base}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f'{self.base}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('announcements', response.data)

    def test_create_announcement_requires_admin(self):
        payload = {'slug': 'new-1', 'title': 'New'}
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(f'{self.base}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'{self.base}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['slug'], 'new-1')
        self.assertEqual(response.data['data']['title'], 'New')

    def test_update_announcement_requires_admin(self):
        ann = Announcement.objects.create(slug='upd-1', title='Original', active=True)
        payload = {'title': 'Updated', 'active': False}
        self.client.force_authenticate(user=self.student_user)
        response = self.client.patch(f'{self.base}/{ann.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(f'{self.base}/{ann.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['title'], 'Updated')
        self.assertFalse(response.data['data']['active'])

    def test_create_validation_slug_required(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(
            f'{self.base}/',
            {'title': 'No slug'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_update_404_for_nonexistent(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f'{self.base}/99999/',
            {'active': False},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
