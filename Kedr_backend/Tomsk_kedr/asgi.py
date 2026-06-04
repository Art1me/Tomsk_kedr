"""ASGI-конфигурация проекта и точка входа application."""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Tomsk_kedr.settings')

application = get_asgi_application()
