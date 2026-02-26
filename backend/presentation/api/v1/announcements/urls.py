"""
URLs de Anuncios/Convocatorias - FagSol Escuela Virtual
"""

from django.urls import path
from presentation.views.announcement_views import (
    get_active_announcement,
    list_or_create_announcements,
    update_announcement,
    upload_announcement_image,
)

urlpatterns = [
    path('active/', get_active_announcement, name='announcements_get_active'),
    path('upload-image/', upload_announcement_image, name='announcements_upload_image'),
    path('', list_or_create_announcements, name='announcements_list_or_create'),
    path('<int:announcement_id>/', update_announcement, name='announcements_update'),
]
