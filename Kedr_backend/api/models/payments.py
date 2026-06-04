"""Модель хранения входящих событий вебхуков платежной системы."""
from django.db import models


class PaymentWebhookEvent(models.Model):
    # Сырые события от YooKassa (для аудита и отладки)
    provider = models.CharField(max_length=50, default='yookassa')
    event_type = models.CharField(max_length=100, blank=True, default='')
    payload = models.JSONField()
    received_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'payment webhook event'
        verbose_name_plural = 'payment webhook events'

    def __str__(self):
        return f'{self.provider}:{self.event_type or "unknown"}:{self.pk}'
