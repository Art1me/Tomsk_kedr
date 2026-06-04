"""Конфигурация приложения api."""
from django.apps import AppConfig


class ApiConfig(AppConfig):
    # Базовые настройки приложения
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
