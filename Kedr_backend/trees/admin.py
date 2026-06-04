"""Админка для деревьев и изображений."""
from django.contrib import admin
from django.utils.html import format_html

from .models import Trees, TreesImages


class TreesImageInline(admin.TabularInline):
    # Инлайн-изображения дерева в админке
    model = TreesImages
    extra = 0
    readonly_fields = ('image_preview',)
    fields = ('image', 'image_preview')

    def image_preview(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" style="max-width:140px; max-height:140px; border:1px solid #999; padding:4px; border-radius:6px;" />',
            obj.image.url,
        )
    image_preview.short_description = 'Предпросмотр'


@admin.register(Trees)
class TreeAdmin(admin.ModelAdmin):
    # Настройки отображения дерева в админке
    list_display = (
        'id',
        'title',
        'owner',
        'creation_date',
        'plant_date',
        'image_preview',
    )
    list_filter = ('creation_date', 'plant_date')
    search_fields = ('title', 'dedicated_to', 'owner__username', 'owner__email')
    readonly_fields = ('image_preview',)
    fields = (
        'title',
        'content',
        'picture',
        'image_preview',
        'latitude',
        'longitude',
        'plant_date',
        'creation_date',
        'dedicated_to',
        'owner',
    )
    inlines = [TreesImageInline]

    def image_preview(self, obj):
        if not obj.picture:
            return '—'
        return format_html(
            '<img src="{}" style="max-width:180px; max-height:180px; border:1px solid #999; padding:4px; border-radius:6px;" />',
            obj.picture.url,
        )
    image_preview.short_description = 'Главное фото'


@admin.register(TreesImages)
class TreesImagesAdmin(admin.ModelAdmin):
    # Отображение отдельных изображений дерева
    list_display = ('id', 'tree', 'image_preview')
    search_fields = ('tree__title',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" style="max-width:140px; max-height:140px; border:1px solid #999; padding:4px; border-radius:6px;" />',
            obj.image.url,
        )
    image_preview.short_description = 'Предпросмотр'
