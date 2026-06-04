"""API-вьюхи для деревьев и платежей."""
import uuid

import requests
from django.conf import settings
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Trees, TreesImages
from .serializers import TreesCoordinatesSerializer, TreesImageSerializer, TreesSerializer

class TreeAPICreate(generics.CreateAPIView):
    # Создание дерева без оплаты (используется отдельно, если нужно)
    serializer_class = TreesSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, format=None):
        # Обработка изображений и создание записи дерева
        images = request.FILES.getlist('images', [])
        request.data.pop('images', None)
        serialized_data = self.serializer_class(data=request.data)
        tree = None
        
        if serialized_data.is_valid():
          #  print('awdasbewghgferghgfe')
          # tree = Trees.objects.create(**serialized_data.data)
          owner = self.request.user if self.request.user.is_authenticated else None
          tree = serialized_data.save(owner=owner)
        
        image_dict = {}
        if tree and len(images) > 0:
            for image_data in images:
                if not isinstance(image_data, dict):
                    image_dict = {'image': image_data, 'tree': str(tree.id)}
                else:
                    image_dict = image_data.copy()
                    image_dict['tree'] = str(tree.id)

                tree_image_serialized_data = TreesImageSerializer(data=image_dict)
                
                if tree_image_serialized_data.is_valid(raise_exception=True):
                    print(tree_image_serialized_data.data)
                    image_obj = TreesImages.objects.create(**tree_image_serialized_data.validated_data)


        return Response( status=status.HTTP_201_CREATED)


class TreesAPIList(generics.ListCreateAPIView):
    # Список деревьев (только оплаченные)
    queryset = Trees.objects.filter(is_paid=True)
    serializer_class = TreesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(owner=self.request.user)
        else:
            print(serializer.errors)





class TreesAPIDetails(generics.RetrieveAPIView):
    # Детали дерева (только оплаченные)
    queryset = Trees.objects.filter(is_paid=True)
    serializer_class = TreesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class TreesAPICoordinates(generics.ListAPIView):
    # Список координат (только оплаченные)
    queryset = Trees.objects.filter(is_paid=True)
    serializer_class = TreesCoordinatesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TreePaymentCreateView(APIView):
    # Создание дерева + инициирование платежа в YooKassa
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        # Проверяем наличие настроек платежной системы
        if not settings.YOOKASSA_SHOP_ID or not settings.YOOKASSA_SECRET_KEY:
            return Response(
                {'detail': 'YooKassa credentials are not configured.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Достаём файлы и данные формы
        images = request.FILES.getlist('images', [])
        data = request.data.copy()
        data.pop('images', None)

        # Валидируем данные дерева
        serializer = TreesSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Создаём дерево в статусе "не оплачено"
        owner = request.user if request.user.is_authenticated else None
        tree = serializer.save(owner=owner, is_paid=False)

        # Сохраняем изображения дерева
        if images:
            for image_data in images:
                image_dict = {'image': image_data, 'tree': str(tree.id)}
                image_serializer = TreesImageSerializer(data=image_dict)
                image_serializer.is_valid(raise_exception=True)
                TreesImages.objects.create(**image_serializer.validated_data)

        # Формируем запрос на создание платежа
        amount_value = settings.YOOKASSA_DEFAULT_AMOUNT
        confirmation = {
            'type': 'redirect',
            'return_url': settings.YOOKASSA_RETURN_URL,
        }
        description = f'Tree registration #{tree.id}'
        payload = {
            'amount': {'value': str(amount_value), 'currency': 'RUB'},
            'capture': True,
            'confirmation': confirmation,
            'description': description,
            'metadata': {'tree_id': str(tree.id)},
        }

        # Чек (если указан email)
        receipt_email = data.get('receipt_email') or data.get('email')
        if receipt_email:
            payload['receipt'] = {
                'customer': {'email': receipt_email},
                'items': [
                    {
                        'description': 'Tree registration',
                        'quantity': '1',
                        'amount': {'value': str(amount_value), 'currency': 'RUB'},
                        'vat_code': 1,
                    }
                ],
            }

        # Идемпотентный ключ, чтобы избежать дублей платежа
        idempotence_key = str(uuid.uuid4())
        try:
            response = requests.post(
                'https://api.yookassa.ru/v3/payments',
                json=payload,
                auth=(settings.YOOKASSA_SHOP_ID, settings.YOOKASSA_SECRET_KEY),
                headers={'Idempotence-Key': idempotence_key},
                timeout=15,
            )
        except requests.RequestException as exc:
            tree.delete()
            return Response(
                {'detail': f'Payment request failed: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # При ошибке удаляем черновик дерева
        if response.status_code not in (200, 201):
            tree.delete()
            return Response(
                {'detail': 'Payment creation failed.', 'response': response.text},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Сохраняем payment_id и возвращаем ссылку на оплату
        payment_data = response.json()
        payment_id = payment_data.get('id')
        confirmation_url = (payment_data.get('confirmation') or {}).get('confirmation_url')

        tree.payment_id = payment_id
        tree.save(update_fields=['payment_id'])

        return Response(
            {
                'payment_id': payment_id,
                'confirmation_url': confirmation_url,
                'tree_id': tree.id,
            },
            status=status.HTTP_201_CREATED,
        )
