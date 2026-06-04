"""Маршруты API для промокодов."""
from django.urls import path

from .views import PromocodeConfirmView, PromocodeGenerateView

urlpatterns = [
    path('generate/', PromocodeGenerateView.as_view(), name='promocode-generate'),
    path('<str:promo>/', PromocodeConfirmView.as_view(), name='promocode-confirm'),
]
