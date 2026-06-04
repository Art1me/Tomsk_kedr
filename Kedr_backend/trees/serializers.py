"""Сериализаторы для деревьев и их изображений."""
from django.template.context_processors import request
from rest_framework import serializers
from .models import Trees, TreesImages

class TreesImageSerializer(serializers.ModelSerializer):
    # Сериализация изображений дерева
    class Meta:
        model = TreesImages
        fields = '__all__'

class TreesSerializer(serializers.ModelSerializer):
    # Сериализация дерева вместе с изображениями
    images = TreesImageSerializer(many=True, read_only=True)
    class Meta:
        model = Trees
        fields = '__all__'
        extra_kwargs = {
            'owner': {'read_only': True},
            'is_paid': {'read_only': True},
            'payment_id': {'read_only': True},
            'paid_at': {'read_only': True},
        }
    
    def get_images(self, obj):
        # Получение связанных изображений
        images = obj.images.all()
        return TreesImageSerializer(images, many=True).data

class TreesCoordinatesSerializer(serializers.ModelSerializer):
    # Облегчённая сериализация координат
    class Meta:
        model = Trees
        fields = ['latitude', 'longitude']
