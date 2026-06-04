from django.db import models
from django.utils import timezone


class News(models.Model):
    title = models.CharField('Название', max_length=255)
    published_at = models.DateTimeField('Дата публикации', default=timezone.now)
    text = models.TextField('Текст')
    created_at = models.DateTimeField('Создано', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлено', auto_now=True)
    likes = models.IntegerField('Лайки', default=0)
    dislikes = models.IntegerField('Дизлайки', default=0)

    class Meta:
        verbose_name = 'новость'
        verbose_name_plural = 'новости'
        ordering = ['-published_at', '-id']

    def __str__(self):
        return self.title


class NewsImage(models.Model):
    news = models.ForeignKey(
        News,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField('Изображение', upload_to='news/')
    created_at = models.DateTimeField('Создано', auto_now_add=True)

    class Meta:
        verbose_name = 'изображение новости'
        verbose_name_plural = 'изображения новостей'

    def __str__(self):
        return f'{self.news_id}'
