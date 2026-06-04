"""Менеджер создания пользователей с кастомными правилами."""
from django.contrib.auth.models import BaseUserManager
from rest_framework.exceptions import ParseError


class CustomBaseManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email=None, password=None, phone_number=None, username=None, **extra_fields):
        # Базовая логика создания пользователя
        if not username and not email:
            raise ParseError('Username or email is required.')

        if email:
            email = self.normalize_email(email)
        if not username:
            username = email

        user = self.model(
            username=username,
            email=email,
            phone_number=phone_number,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, phone_number=None, username=None, **extra_fields):
        # Создание обычного пользователя
        if not email:
            raise ParseError('Email is required for regular users.')

        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_active', False)

        return self._create_user(
            email=email,
            password=password,
            phone_number=phone_number,
            username=username,
            **extra_fields,
        )

    def create_superuser(self, email=None, password=None, phone_number=None, username=None, **extra_fields):
        # Создание суперпользователя
        if not username and not email:
            raise ParseError('Username is required for superusers.')

        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)

        return self._create_user(
            email=email,
            password=password,
            phone_number=phone_number,
            username=username,
            **extra_fields,
        )
