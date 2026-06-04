"""Глобальные URL-маршруты проекта."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path
from api.urls import urlpatterns as api_urls


# Базовые маршруты админки и сессионной авторизации
urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]
# Подключаем все API-маршруты из приложения api
urlpatterns += api_urls

if settings.DEBUG:
    # Раздача медиа в режиме разработки
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
