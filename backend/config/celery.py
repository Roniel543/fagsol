"""
Celery configuration for FagSol Escuela Virtual
"""
import os
from celery import Celery

# Establecer la configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('fagsol')

# Usar string para que no sea necesario serializar objetos
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscovery de tareas en todas las apps instaladas
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

