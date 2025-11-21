# Generated manually for InstructorApplication model
# Date: 2025-01-12

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_add_instructor_approval_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="InstructorApplication",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "professional_title",
                    models.CharField(
                        blank=True,
                        help_text="Título profesional o certificación (ej: Ingeniero, Licenciado, etc.)",
                        max_length=200,
                        verbose_name="Título Profesional",
                    ),
                ),
                (
                    "experience_years",
                    models.IntegerField(
                        default=0,
                        help_text="Años de experiencia en el área de especialización",
                        verbose_name="Años de Experiencia",
                    ),
                ),
                (
                    "specialization",
                    models.CharField(
                        blank=True,
                        help_text="Área de especialización (ej: Metalurgia, Energías Renovables, etc.)",
                        max_length=200,
                        verbose_name="Especialidad",
                    ),
                ),
                (
                    "bio",
                    models.TextField(
                        blank=True,
                        help_text="Cuéntanos sobre ti y tu experiencia profesional",
                        verbose_name="Biografía",
                    ),
                ),
                (
                    "portfolio_url",
                    models.URLField(
                        blank=True,
                        help_text="URL de tu portfolio, website o perfil profesional",
                        null=True,
                        verbose_name="Portfolio/Website",
                    ),
                ),
                (
                    "cv_file",
                    models.FileField(
                        blank=True,
                        help_text="Archivo PDF con tu currículum vitae (opcional)",
                        null=True,
                        upload_to="instructor_applications/cv/",
                        verbose_name="CV (PDF)",
                    ),
                ),
                (
                    "motivation",
                    models.TextField(
                        help_text="¿Por qué quieres ser instructor en FagSol? ¿Qué te motiva a enseñar?",
                        verbose_name="Motivación",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pendiente"),
                            ("approved", "Aprobado"),
                            ("rejected", "Rechazado"),
                        ],
                        default="pending",
                        help_text="Estado de la solicitud",
                        max_length=20,
                        verbose_name="Estado",
                    ),
                ),
                (
                    "reviewed_at",
                    models.DateTimeField(
                        blank=True,
                        help_text="Fecha y hora en que se revisó la solicitud",
                        null=True,
                        verbose_name="Fecha de Revisión",
                    ),
                ),
                (
                    "rejection_reason",
                    models.TextField(
                        blank=True,
                        help_text="Razón por la cual la solicitud fue rechazada (si aplica)",
                        null=True,
                        verbose_name="Razón de Rechazo",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="Fecha de Creación"
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True, verbose_name="Fecha de Actualización"
                    ),
                ),
                (
                    "reviewed_by",
                    models.ForeignKey(
                        blank=True,
                        help_text="Administrador que revisó la solicitud",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reviewed_applications",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Revisado por",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Usuario que solicita ser instructor",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="instructor_applications",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Usuario",
                    ),
                ),
            ],
            options={
                "verbose_name": "Solicitud de Instructor",
                "verbose_name_plural": "Solicitudes de Instructores",
                "db_table": "instructor_applications",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="instructorapplication",
            index=models.Index(
                fields=["status", "-created_at"], name="instructor_status_created_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="instructorapplication",
            index=models.Index(
                fields=["user", "status"], name="instructor_user_status_idx"
            ),
        ),
    ]

