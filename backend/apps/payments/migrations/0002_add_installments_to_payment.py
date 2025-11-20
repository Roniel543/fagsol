# Generated migration for adding installments field to Payment model

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='installments',
            field=models.IntegerField(
                default=1,
                help_text='Número de cuotas del pago',
                validators=[django.core.validators.MinValueValidator(1)],
                verbose_name='Cuotas'
            ),
        ),
    ]

