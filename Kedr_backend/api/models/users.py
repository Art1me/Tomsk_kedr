"""Модели пользователей и их профилей."""
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField  # type: ignore

from api.managers import CustomBaseManager


class User(AbstractBaseUser, PermissionsMixin):
    # Базовая модель пользователя
    username = models.CharField('Логин', unique=True, max_length=150)
    email = models.EmailField('Email', unique=True, null=True, blank=True)
    phone_number = PhoneNumberField('Телефон', unique=True, null=True, blank=True)
    is_verified = models.BooleanField('Подтвержден', default=False)
    is_active = models.BooleanField('Активен', default=False)
    is_staff = models.BooleanField('Сотрудник', default=False)
    date_joined = models.DateTimeField('Дата регистрации', auto_now_add=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = CustomBaseManager()

    class Meta:
        verbose_name = 'пользователь'
        verbose_name_plural = 'пользователи'

    def __str__(self):
        return self.username or self.email or str(self.pk)


class SimpleUserProfile(models.Model):
    # Профиль обычного пользователя
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='simple_profile',
    )
    first_name = models.CharField('Имя', max_length=100)
    last_name = models.CharField('Фамилия', max_length=100)
    surname = models.CharField('Отчество', max_length=100, null=True, blank=True)
    birthday = models.DateField('Дата рождения')
    is_editor = models.BooleanField('Редактор', default=False)

    class Meta:
        verbose_name = 'профиль пользователя'
        verbose_name_plural = 'профили пользователей'

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class PartnerProfile(models.Model):
    # Профиль партнёра
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='partner_profile',
    )
    name = models.CharField('Название', max_length=255)
    inn = models.CharField('ИНН', max_length=32, null=True, blank=True)
    address = models.CharField('Адрес', max_length=255)
    owner_first_name = models.CharField('Имя владельца', max_length=100)
    owner_last_name = models.CharField('Фамилия владельца', max_length=100)
    owner_surname = models.CharField('Отчество владельца', max_length=100, null=True, blank=True)
    owner_birthday = models.DateField('Дата рождения владельца')
    coordinator_fio = models.CharField('ФИО координатора', max_length=255, null=True, blank=True)
    coordinator_phone = models.CharField('Телефон координатора', max_length=64, null=True, blank=True)
    coordinator_email = models.EmailField('Email координатора', null=True, blank=True)
    accountant_fio = models.CharField('ФИО бухгалтера', max_length=255, null=True, blank=True)
    accountant_phone = models.CharField('Телефон бухгалтера', max_length=64, null=True, blank=True)
    accountant_email = models.EmailField('Email бухгалтера', null=True, blank=True)

    class Meta:
        verbose_name = 'профиль партнера'
        verbose_name_plural = 'профили партнеров'

    def __str__(self):
        return self.name


class PasswordChangeRequest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_change_requests",
    )
    token = models.CharField(max_length=128, unique=True)
    new_password_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        verbose_name = "запрос смены пароля"
        verbose_name_plural = "запросы смены пароля"

    def __str__(self):
        return f"{self.user_id} {self.created_at}"
