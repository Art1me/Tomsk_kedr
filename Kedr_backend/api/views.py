"""API-вьюхи: регистрация, активация и вебхук платежей."""
import json
import logging
import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Q
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.utils.http import urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from djoser.views import UserViewSet as DjoserUserViewSet
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings
from django.utils import timezone

from api.models import PartnerProfile, PaymentWebhookEvent, PasswordChangeRequest
from trees.models import Trees
from api.serializers import (
    AdminCompanySerializer,
    AdminUserSerializer,
    PartnerCompanyListSerializer,
    PartnerUserCreateSerializer,
    SimpleUserCreateSerializer,
    PasswordChangeRequestSerializer,
)

logger = logging.getLogger(__name__)

class CustomUserViewSet(DjoserUserViewSet):
    # Расширяем Djoser при необходимости (пока без изменений)
    def update_password(self, request, instance):
        """update password if 'new_password_verify' and 'new_password' are in request"""
        if "new_password" in request.data:
            instance.set_password(request.data["new_password"])
            instance.save()
            return True
        return False

class CreateSimpleUserView(generics.CreateAPIView):
    # Регистрация обычного пользователя
    permission_classes = [AllowAny]
    serializer_class = SimpleUserCreateSerializer


class CreatePartnerUserView(generics.CreateAPIView):
    # Регистрация партнёра
    permission_classes = [AllowAny]
    serializer_class = PartnerUserCreateSerializer


class CompanyListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PartnerCompanyListSerializer
    queryset = PartnerProfile.objects.all().order_by('name')


class AdminCompanyListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCompanySerializer

    def get_queryset(self):
        queryset = PartnerProfile.objects.select_related('user').order_by('-id')
        search = (self.request.query_params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(inn__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__phone_number__icontains=search)
                | Q(coordinator_fio__icontains=search)
            )
        return queryset


class AdminCompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCompanySerializer
    lookup_url_kwarg = 'company_id'

    def get_queryset(self):
        return PartnerProfile.objects.select_related('user').all()

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        user.delete()


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        user_model = get_user_model()
        queryset = (
            user_model.objects
            .select_related('simple_profile', 'partner_profile')
            .order_by('-id')
        )
        search = (self.request.query_params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(phone_number__icontains=search)
                | Q(simple_profile__first_name__icontains=search)
                | Q(simple_profile__last_name__icontains=search)
                | Q(simple_profile__surname__icontains=search)
                | Q(partner_profile__name__icontains=search)
            )
        return queryset


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    lookup_url_kwarg = 'user_id'

    def get_queryset(self):
        user_model = get_user_model()
        return user_model.objects.select_related('simple_profile', 'partner_profile').all()


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        user_model = get_user_model()
        return Response(
            {
                'companies_total': PartnerProfile.objects.count(),
                'companies_active': PartnerProfile.objects.filter(user__is_active=True).count(),
                'users_total': user_model.objects.count(),
                'users_active': user_model.objects.filter(is_active=True).count(),
            },
            status=status.HTTP_200_OK,
        )


class CompanyDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = PartnerProfile.objects.all()
    lookup_url_kwarg = 'company_id'

    def perform_destroy(self, instance):
        if not (self.request.user.is_staff or instance.user_id == self.request.user.id):
            raise PermissionDenied('You do not have permission to delete this company.')
        instance.delete()


class CompanyConfirmByAdminView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, company_id):
        company = PartnerProfile.objects.filter(pk=company_id).select_related('user').first()
        if not company:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)

        user = company.user
        if not user.is_active or not user.is_verified:
            user.is_active = True
            user.is_verified = True
            user.save(update_fields=['is_active', 'is_verified'])

        return Response({"detail": "Company confirmed."}, status=status.HTTP_200_OK)


class UserConfirmEmailView(APIView):
    # Подтверждение email по токену
    permission_classes = [AllowAny]

    def get(self, request, uid, token):
        user_model = get_user_model()
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = user_model.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, user_model.DoesNotExist):
            user = None

        if user and hasattr(user, 'partner_profile'):
            return Response(
                {"detail": "Company accounts are confirmed by admin only."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if user and default_token_generator.check_token(user, token):
            # Активируем пользователя и отмечаем подтверждение
            user.is_active = True
            user.is_verified = True
            user.save(update_fields=['is_active', 'is_verified'])
            return redirect('http://88.218.67.221:3000/')

        return Response(
            {"detail": "Could not confirm email."},
            status=status.HTTP_400_BAD_REQUEST,
        )


@method_decorator(csrf_exempt, name='dispatch')
class YooKassaWebhookView(APIView):
    # Входящая точка вебхука YooKassa
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        # Проверка токена вебхука (если задан в .env)
        expected_token = getattr(settings, 'YOOKASSA_WEBHOOK_TOKEN', '')
        if expected_token:
            header_token = request.headers.get('X-Webhook-Token') or ''
            auth_header = request.headers.get('Authorization') or ''
            if auth_header.startswith('Bearer '):
                header_token = auth_header.replace('Bearer ', '', 1)
            if header_token != expected_token:
                return Response({'detail': 'Invalid webhook token.'}, status=status.HTTP_403_FORBIDDEN)

        # Пытаемся безопасно распарсить JSON
        try:
            payload = request.data
            if not isinstance(payload, dict):
                payload = json.loads(request.body.decode('utf-8') or '{}')
        except (TypeError, ValueError, UnicodeDecodeError):
            payload = {}

        event_type = ''
        if isinstance(payload, dict):
            event_type = payload.get('event') or payload.get('type') or ''

        # Сохраняем событие в базе для аудита
        PaymentWebhookEvent.objects.create(
            provider='yookassa',
            event_type=event_type,
            payload=payload,
        )

        if isinstance(payload, dict):
            obj = payload.get('object') or {}
            payment_id = obj.get('id')
            status_value = obj.get('status')
            metadata = obj.get('metadata') or {}
            tree_id = metadata.get('tree_id')

            # При успешном платеже отмечаем дерево как оплаченное
            if event_type == 'payment.succeeded' or status_value == 'succeeded':
                tree = None
                if tree_id:
                    tree = Trees.objects.filter(pk=tree_id).first()
                if not tree and payment_id:
                    tree = Trees.objects.filter(payment_id=payment_id).first()
                if tree and not tree.is_paid:
                    tree.is_paid = True
                    tree.paid_at = timezone.now()
                    tree.save(update_fields=['is_paid', 'paid_at'])

        logger.info('YooKassa webhook received: %s', event_type or 'unknown')
        return Response({'status': 'ok'})


class PasswordChangeRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeRequestSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        token = secrets.token_urlsafe(32)
        new_password_hash = make_password(serializer.validated_data['new_password'])

        PasswordChangeRequest.objects.filter(user=user, is_used=False).update(is_used=True)
        PasswordChangeRequest.objects.create(
            user=user,
            token=token,
            new_password_hash=new_password_hash,
        )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        confirm_path = reverse('password-change-confirm', kwargs={'uid': uid, 'token': token})
        confirm_url = request.build_absolute_uri(confirm_path)

        subject = 'Confirm password change'
        message = (
            'Confirm your password change by following this link:\n'
            f'{confirm_url}\n'
        )
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except OSError:
            logger.exception('Could not send password change email to %s', user.email)
            if settings.DEBUG:
                logger.info('Password change URL for %s: %s', user.email, confirm_url)

        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordChangeConfirmView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uid, token):
        user_model = get_user_model()
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = user_model.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, user_model.DoesNotExist):
            user = None

        if not user:
            return Response({"detail": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)

        change_request = PasswordChangeRequest.objects.filter(
            user=user,
            token=token,
            is_used=False,
        ).order_by('-created_at').first()

        if not change_request:
            return Response({"detail": "Invalid or used token."}, status=status.HTTP_400_BAD_REQUEST)

        if change_request.created_at < timezone.now() - timedelta(hours=24):
            return Response({"detail": "Token expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.password = change_request.new_password_hash
        user.save(update_fields=['password'])
        change_request.is_used = True
        change_request.save(update_fields=['is_used'])

        return Response({"detail": "Password changed."}, status=status.HTTP_200_OK)
