# Generated manually - Add image upload field to Announcement

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("announcements", "0002_rename_announcement_active_8a1b2c_idx_announcemen_active_96b1c3_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="announcement",
            name="image",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="announcements/",
                verbose_name="Imagen (subir archivo)",
                help_text="Imagen del anuncio. Se usa en lugar de URL de imagen si está definida.",
            ),
        ),
    ]
