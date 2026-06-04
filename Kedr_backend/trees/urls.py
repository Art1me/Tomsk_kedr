"""Маршруты API для деревьев."""
from django.urls import path

from . import views

urlpatterns = [
    # Создание дерева (без оплаты)
    path('create/', views.TreeAPICreate.as_view(), name='trees-create'),
    # Список/детали/координаты деревьев
    path('', views.TreesAPIList.as_view(), name='trees-list'),
    path('<int:pk>/', views.TreesAPIDetails.as_view(), name='trees-detail'),
    path('coordinates/', views.TreesAPICoordinates.as_view(), name='trees-coordinates'),
]
