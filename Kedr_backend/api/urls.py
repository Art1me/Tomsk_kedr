"""Маршруты API приложения."""
from django.urls import include, path

from api import views
from api.views import (
    AdminCompanyDetailView,
    AdminCompanyListCreateView,
    AdminStatsView,
    AdminUserDetailView,
    AdminUserListView,
    CompanyConfirmByAdminView,
    CompanyDeleteView,
    CompanyListView,
    CreatePartnerUserView,
    CreateSimpleUserView,
    CustomUserViewSet,
    YooKassaWebhookView,
    PasswordChangeRequestView,
    PasswordChangeConfirmView,
)
from trees.views import TreePaymentCreateView

urlpatterns = [
    # Djoser: базовые эндпоинты пользователей
    path('api/', include('djoser.urls')),
    # Активация пользователя по ссылке
    path('api/users/activate/<str:uid>/<str:token>/', views.UserConfirmEmailView.as_view(), name='user-activate'),
    # Регистрация пользователей
    path('api/registration/', CustomUserViewSet.as_view({'post': 'create'}), name='user-registration'),
    path('api/registration/simple/', CreateSimpleUserView.as_view(), name='simple-user-registration'),
    path('api/registration/partner/', CreatePartnerUserView.as_view(), name='partner-registration'),
    path('api/companies/', CompanyListView.as_view(), name='company-list'),
    path('api/companies/<int:company_id>/', CompanyDeleteView.as_view(), name='company-delete'),
    path('api/companies/<int:company_id>/confirm/', CompanyConfirmByAdminView.as_view(), name='company-confirm'),
    path('api/admin/companies/', AdminCompanyListCreateView.as_view(), name='admin-company-list-create'),
    path('api/admin/companies/<int:company_id>/', AdminCompanyDetailView.as_view(), name='admin-company-detail'),
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('api/admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('api/admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    # Токены и JWT
    path('api/djoser-auth/', include('djoser.urls.authtoken')),
    path('api/djoser-auth/', include('djoser.urls.jwt')),
    # Запрос смены пароля с подтверждением по email
    path('api/password/change/', PasswordChangeRequestView.as_view(), name='password-change-request'),
    path('api/password/change/confirm/<str:uid>/<str:token>/', PasswordChangeConfirmView.as_view(), name='password-change-confirm'),
    # Встроенная авторизация DRF (браузерный вход)
    path('api/auth/', include('rest_framework.urls')),
    # Деревья и промокоды
    path('api/trees/', include('trees.urls')),
    path('api/promocodes/', include('promocodes.urls')),
    # разные запросы под оду ссылку: 
    #GET /api/news/ — список новостей
    #POST /api/news/ — создание новости
    #GET /api/news/<id>/ — конкретная новость
    path('api/news/', include('News.urls')),
    # Платежи: вебхук и создание платежа
    path('api/payments/webhook/yookassa/', YooKassaWebhookView.as_view(), name='yookassa-webhook'),
    path('api/payments/trees/create/', TreePaymentCreateView.as_view(), name='trees-payment-create'),
]
