"""API-вьюхи для промокодов."""
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Promocode


class PromocodeGenerateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        code = Promocode.generate_unique_code(length=8)
        promocode = Promocode.objects.create(code=code)
        return Response(
            {
                'id': promocode.id,
                'code': promocode.code,
                'is_activated': promocode.is_activated,
            },
            status=status.HTTP_201_CREATED,
        )


class PromocodeConfirmView(APIView):
    permission_classes = [AllowAny]

    # Проверяем наличие промокода и помечаем использованным
    def get(self, request, promo):
        normalized_promo = promo.strip().upper()
        found_promo = Promocode.objects.filter(code=normalized_promo).first()
        if not found_promo:
            return Response({"detail": "Promocode not found"}, status=status.HTTP_404_NOT_FOUND)

        if found_promo.is_activated:
            return Response(
                {"detail": "Promocode already used"},
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )

        found_promo.is_activated = True
        found_promo.save(update_fields=['is_activated'])
        return Response(status=status.HTTP_200_OK)
