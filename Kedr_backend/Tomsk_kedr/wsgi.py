"""WSGI-конфигурация проекта и точка входа application."""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Tomsk_kedr.settings')

application = get_wsgi_application()
