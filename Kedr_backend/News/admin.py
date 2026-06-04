from django.contrib import admin

from .models import News, NewsImage


class NewsImageInline(admin.TabularInline):
    model = NewsImage
    extra = 5


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'published_at','likes')
    list_filter = ('published_at',)
    search_fields = ('title',)
    inlines = [NewsImageInline]


@admin.register(NewsImage)
class NewsImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'news', 'created_at')
