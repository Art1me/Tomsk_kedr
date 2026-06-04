import json

from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import News, NewsImage
from .serializers import NewsSerializer
from .permissions import IsEditorOrStaff


class NewsListCreateView(generics.ListCreateAPIView):
    queryset = News.objects.all()
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsEditorOrStaff()]
        return [AllowAny()]

    def perform_create(self, serializer):
        news = serializer.save()
        images = self.request.FILES.getlist('images')
        for image in images:
            NewsImage.objects.create(news=news, image=image)


class NewsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = News.objects.all()
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method == 'PATCH' and self._is_rating_update():
            return [AllowAny()]
        return [IsEditorOrStaff()]

    def _is_rating_update(self):
        return set(self.request.data.keys()).issubset({'likes', 'dislikes'})

    def perform_update(self, serializer):
        news = serializer.save()
        existing_images_raw = self.request.data.get('existing_images')
        new_images = (
            self.request.FILES.getlist('new_images')
            or self.request.FILES.getlist('images')
        )

        if existing_images_raw is not None:
            try:
                existing_image_ids = json.loads(existing_images_raw)
            except (TypeError, ValueError):
                existing_image_ids = []
            news.images.exclude(id__in=existing_image_ids).delete()

        for image in new_images:
            NewsImage.objects.create(news=news, image=image)
