"""Модели промокодов."""
import secrets
import string

from django.db import models

# Модель промокода для проверки скидок/доступа
class Promocode(models.Model):
    code = models.CharField('Промокод', max_length=16, unique=True)
    is_activated = models.BooleanField('Активирован', default=False)

    class Meta:
        verbose_name = 'промокод'
        verbose_name_plural = 'промокоды'

    @classmethod
    def generate_unique_code(cls, length=8):
        alphabet = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(alphabet) for _ in range(length))
            if not cls.objects.filter(code=code).exists():
                return code
