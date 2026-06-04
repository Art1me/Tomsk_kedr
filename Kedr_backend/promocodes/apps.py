"""Конфигурация приложения promocodes."""
from django.apps import AppConfig


class PromocodesConfig(AppConfig):
    # Базовые настройки приложения
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'promocodes'
