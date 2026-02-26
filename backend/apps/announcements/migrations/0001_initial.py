# Generated manually for FagSol announcements app

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Announcement",
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
                    "slug",
                    models.SlugField(
                        help_text='Identificador único (ej: practicantes-2026). Usado para "No volver a mostrar".',
                        max_length=80,
                        unique=True,
                    ),
                ),
                (
                    "title",
                    models.CharField(
                        help_text="Título principal del anuncio.",
                        max_length=200,
                    ),
                ),
                (
                    "summary",
                    models.CharField(
                        blank=True,
                        help_text="Resumen corto (opcional).",
                        max_length=500,
                    ),
                ),
                (
                    "body",
                    models.TextField(
                        blank=True,
                        help_text="Cuerpo del anuncio (texto plano o HTML sanitizado en frontend).",
                    ),
                ),
                (
                    "cta_text",
                    models.CharField(
                        blank=True,
                        help_text="Texto del botón de acción (ej: Ver más).",
                        max_length=100,
                    ),
                ),
                (
                    "cta_url",
                    models.URLField(
                        blank=True,
                        help_text="URL del botón de acción.",
                        max_length=500,
                        null=True,
                    ),
                ),
                (
                    "image_url",
                    models.URLField(
                        blank=True,
                        help_text="URL de imagen del anuncio (opcional).",
                        max_length=500,
                        null=True,
                    ),
                ),
                (
                    "active",
                    models.BooleanField(
                        default=True,
                        help_text="Si está desactivado, no se muestra en el sitio.",
                    ),
                ),
                (
                    "starts_at",
                    models.DateTimeField(
                        blank=True,
                        help_text="Fecha/hora desde la cual se muestra (opcional).",
                        null=True,
                    ),
                ),
                (
                    "ends_at",
                    models.DateTimeField(
                        blank=True,
                        help_text="Fecha/hora hasta la cual se muestra (opcional).",
                        null=True,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Anuncio",
                "verbose_name_plural": "Anuncios",
                "db_table": "announcements",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="announcement",
            index=models.Index(
                fields=["active", "-created_at"],
                name="announcement_active_8a1b2c_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="announcement",
            index=models.Index(fields=["slug"], name="announcement_slug_9d4e5f_idx"),
        ),
    ]
