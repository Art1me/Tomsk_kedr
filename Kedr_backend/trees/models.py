"""Модели деревьев и их изображений."""
from django.conf import settings
from django.db import models
import datetime


class Trees(models.Model):
    # Основная модель дерева
    title = models.CharField('Название', max_length=100, default='Дерево')
    content = models.TextField('Описание', null=True, blank=True)
    picture = models.ImageField('Фото', upload_to='photo_trees/', null=True, blank=True)
    latitude = models.FloatField('Широта')
    longitude = models.FloatField('Долгота')
    plant_date = models.DateField(default=datetime.date(2000, 9, 9))
    creation_date = models.DateField('Дата создания', auto_now_add=True, null=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='trees_owned',
        null=True,
    )
    dedicated_to = models.CharField('Посвящено', max_length=100, default='', blank=True)
    # Поля оплаты (показываем дерево только после успешного платежа)
    is_paid = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=128, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'дерево'
        verbose_name_plural = 'деревья'


class TreesImages(models.Model):
    # Дополнительные фотографии дерева
    tree = models.ForeignKey(Trees, on_delete=models.CASCADE, related_name='images', verbose_name='Дерево')
    image = models.ImageField('Фото', upload_to='photo_trees/', null=True, blank=True)

    class Meta:
        verbose_name = 'фото дерева'
        verbose_name_plural = 'фото деревьев'
