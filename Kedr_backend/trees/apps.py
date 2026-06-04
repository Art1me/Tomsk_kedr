"""Конфигурация приложения trees."""
from django.apps import AppConfig


class TreesConfig(AppConfig):
    # Базовые настройки приложения
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'trees'
