from rest_framework import serializers

from .models import News, NewsImage


class NewsImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsImage
        fields = ['id', 'image', 'created_at',]
        read_only_fields = ['id', 'created_at']


class NewsSerializer(serializers.ModelSerializer):
    images = NewsImageSerializer(many=True, read_only=True)

    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'published_at',
            'created_at',
            'updated_at',
            'text',
            'images',
            'likes',
            'dislikes',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
