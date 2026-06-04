"""Сериализаторы пользователей и профилей."""
import logging
import secrets
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
import re
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions

from api.models import PartnerProfile, SimpleUserProfile, User


logger = logging.getLogger(__name__)




class SimpleUserProfileSerializer(serializers.ModelSerializer):
    # Public fields for simple user profile
    class Meta:
        model = SimpleUserProfile
        fields = [
            'first_name',
            'last_name',
            'surname',
            'birthday',
            'is_editor',
        ]
        extra_kwargs = {
            'birthday': {'required': False},
        }


class PartnerProfileSerializer(serializers.ModelSerializer):
    # Public fields for partner profile
    class Meta:
        model = PartnerProfile
        fields = [
            'name',
            'inn',
            'address',
            'owner_first_name',
            'owner_last_name',
            'owner_surname',
            'owner_birthday',
            'coordinator_fio',
            'coordinator_phone',
            'coordinator_email',
            'accountant_fio',
            'accountant_phone',
            'accountant_email',
        ]
        extra_kwargs = {
            'owner_birthday': {'required': False},
        }


class PartnerCompanyListSerializer(serializers.ModelSerializer):
    # Public fields for company list endpoint
    email = serializers.EmailField(source='user.email', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    registered_at = serializers.DateTimeField(source='user.date_joined', read_only=True)

    class Meta:
        model = PartnerProfile
        fields = [
            'id',
            'name',
            'inn',
            'address',
            'email',
            'phone_number',
            'owner_first_name',
            'owner_last_name',
            'owner_surname',
            'owner_birthday',
            'coordinator_fio',
            'coordinator_phone',
            'coordinator_email',
            'accountant_fio',
            'accountant_phone',
            'accountant_email',
            'is_active',
            'is_verified',
            'registered_at',
        ]


class UserSerializer(serializers.ModelSerializer):
    # Public user representation + profile type and data
    profile_type = serializers.SerializerMethodField()
    simple_profile = SimpleUserProfileSerializer(read_only=True)
    partner_profile = PartnerProfileSerializer(read_only=True)

    def get_profile_type(self, obj):
        if hasattr(obj, 'partner_profile'):
            return 'partner'
        if hasattr(obj, 'simple_profile'):
            return 'simple'
        return 'unknown'

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'phone_number',
            'profile_type',
            'simple_profile',
            'partner_profile',
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    profile_type = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()
    registered_at = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'phone_number',
            'full_name',
            'company',
            'profile_type',
            'is_active',
            'is_verified',
            'is_staff',
            'is_superuser',
            'registered_at',
        ]
        read_only_fields = ['id', 'username', 'registered_at']

    def get_profile_type(self, obj):
        if hasattr(obj, 'partner_profile'):
            return 'partner'
        if hasattr(obj, 'simple_profile'):
            return 'simple'
        return 'unknown'

    def get_full_name(self, obj):
        profile = getattr(obj, 'simple_profile', None)
        if profile:
            return ' '.join(
                part for part in [profile.last_name, profile.first_name, profile.surname] if part
            )
        partner = getattr(obj, 'partner_profile', None)
        if partner:
            return partner.name
        return obj.email or obj.username

    def get_company(self, obj):
        partner = getattr(obj, 'partner_profile', None)
        if partner:
            return partner.name
        return ''


class AdminCompanySerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    phone_number = serializers.CharField(source='user.phone_number', required=False, allow_blank=True, allow_null=True)
    is_active = serializers.BooleanField(source='user.is_active', required=False)
    is_verified = serializers.BooleanField(source='user.is_verified', required=False)
    registered_at = serializers.DateTimeField(source='user.date_joined', read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = PartnerProfile
        fields = [
            'id',
            'name',
            'inn',
            'address',
            'email',
            'phone_number',
            'password',
            'owner_first_name',
            'owner_last_name',
            'owner_surname',
            'owner_birthday',
            'coordinator_fio',
            'coordinator_phone',
            'coordinator_email',
            'accountant_fio',
            'accountant_phone',
            'accountant_email',
            'is_active',
            'is_verified',
            'registered_at',
        ]
        read_only_fields = ['id', 'registered_at']
        extra_kwargs = {
            'address': {'required': False, 'allow_blank': True},
            'owner_birthday': {'required': False},
        }

    def _validate_user_unique(self, email, phone_number, user=None):
        errors = {}
        users = User.objects.all()
        if user is not None:
            users = users.exclude(pk=user.pk)
        if email and users.filter(email__iexact=email).exists():
            errors['email'] = ['Пользователь с таким email уже существует.']
        if phone_number and users.filter(phone_number=phone_number).exists():
            errors['phone_number'] = ['Пользователь с таким телефоном уже существует.']
        if errors:
            raise serializers.ValidationError(errors)

    def validate(self, attrs):
        user_data = attrs.get('user') or {}
        email = user_data.get('email')
        phone_number = user_data.get('phone_number')
        instance_user = self.instance.user if self.instance else None
        self._validate_user_unique(email, phone_number, instance_user)
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop('user', {})
        password = validated_data.pop('password', '') or secrets.token_urlsafe(12)
        email = (user_data.get('email') or '').strip().lower()
        phone_number = user_data.get('phone_number') or None
        if not email:
            raise serializers.ValidationError({'email': ['Email обязателен для компании.']})

        user = User.objects.create_user(
            email=email,
            username=email,
            phone_number=phone_number,
            password=password,
        )
        user.is_active = user_data.get('is_active', True)
        user.is_verified = user_data.get('is_verified', True)
        user.save(update_fields=['is_active', 'is_verified'])

        defaults = {
            'address': '',
            'owner_birthday': '1970-01-01',
        }
        defaults.update(validated_data)
        return PartnerProfile.objects.create(user=user, **defaults)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        password = validated_data.pop('password', None)
        user = instance.user
        for attr, value in user_data.items():
            if attr == 'email' and value:
                value = value.strip().lower()
                user.username = value
            if attr == 'phone_number' and value == '':
                value = None
            setattr(user, attr, value)
        if password:
            user.set_password(password)
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UserUpdateSerializer(serializers.ModelSerializer):
    simple_profile = SimpleUserProfileSerializer(required=False)
    partner_profile = PartnerProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'phone_number',
            'simple_profile',
            'partner_profile',
        ]
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'phone_number': {'required': False},
        }

    def update(self, instance, validated_data):
        simple_profile_data = validated_data.pop('simple_profile', None)
        partner_profile_data = validated_data.pop('partner_profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if simple_profile_data is not None:
            SimpleUserProfile.objects.update_or_create(
                user=instance,
                defaults=simple_profile_data,
            )

        if partner_profile_data is not None:
            PartnerProfile.objects.update_or_create(
                user=instance,
                defaults=partner_profile_data,
            )

        return instance


class UserCreateSerializer(BaseUserCreateSerializer):
    # Базовый сериализатор регистрации пользователя
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'password']
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True, 'read_only': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        # Приводим email/username к нижнему регистру
        username = attrs.get('username')
        email = attrs.get('email')
        phone_number = attrs.get('phone_number')
        if email:
            attrs['email'] = email.strip().lower()
        if username:
            attrs['username'] = username.strip().lower()
        elif attrs.get('email'):
            attrs['username'] = attrs['email']

        errors = {}
        if attrs.get('email') and User.objects.filter(email__iexact=attrs['email']).exists():
            errors['email'] = ['Пользователь с таким email уже зарегистрирован.']
        if attrs.get('username') and User.objects.filter(username__iexact=attrs['username']).exists():
            errors['email'] = ['Пользователь с таким email уже зарегистрирован.']
        if phone_number and User.objects.filter(phone_number=phone_number).exists():
            errors['phone_number'] = ['Пользователь с таким телефоном уже зарегистрирован.']
        if errors:
            raise serializers.ValidationError(errors)

        return super().validate(attrs)

    def send_activation_email(self, user):
        # Отправка письма с ссылкой активации
        request = self.context.get('request')
        if request is None:
            return

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_url_template = settings.DJOSER.get('EMAIL_FRONTEND_URL', '').strip()
        if activation_url_template:
            activation_url = activation_url_template.format(uid=uid, token=token)
        else:
            activation_path = reverse('user-activate', kwargs={'uid': uid, 'token': token})
            activation_url = request.build_absolute_uri(activation_path)

        subject = 'Activate your account'
        message = (
            'Please activate your account by following this link:\n'
            f'{activation_url}\n'
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
            logger.exception('Could not send activation email to %s', user.email)
            if settings.DEBUG:
                logger.info('Activation URL for %s: %s', user.email, activation_url)


class SimpleUserCreateSerializer(UserCreateSerializer):
    # Регистрация обычного пользователя + профиль
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    surname = serializers.CharField(write_only=True, required=False, allow_blank=True)
    birthday = serializers.DateField(write_only=True)
    is_editor = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta(UserCreateSerializer.Meta):
        fields = UserCreateSerializer.Meta.fields + [
            'first_name',
            'last_name',
            'surname',
            'birthday',
            'is_editor',
        ]

    def validate(self, attrs):
        # Разделяем поля профиля и базовые поля пользователя
        profile_fields = {
            'first_name': attrs.get('first_name'),
            'last_name': attrs.get('last_name'),
            'surname': attrs.get('surname'),
            'birthday': attrs.get('birthday'),
            'is_editor': attrs.get('is_editor'),
        }
        base_attrs = {k: v for k, v in attrs.items() if k not in profile_fields}
        validated = super().validate(base_attrs)
        validated.update(profile_fields)
        return validated

    def create(self, validated_data):
        # Создаём пользователя и профиль
        profile_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'surname': validated_data.pop('surname', None),
            'birthday': validated_data.pop('birthday'),
            'is_editor': validated_data.pop('is_editor', False),
        }
        user = User.objects.create_user(**validated_data)
        SimpleUserProfile.objects.create(user=user, **profile_data)
        self.send_activation_email(user)
        return user


class PartnerUserCreateSerializer(UserCreateSerializer):
    # Регистрация партнёра + профиль партнёра
    partner_name = serializers.CharField(write_only=True)
    partner_address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    inn = serializers.CharField(write_only=True, required=False, allow_blank=True)
    owner_first_name = serializers.CharField(write_only=True)
    owner_last_name = serializers.CharField(write_only=True)
    owner_surname = serializers.CharField(write_only=True, required=False, allow_blank=True)
    owner_birthday = serializers.DateField(write_only=True)
    class Meta(UserCreateSerializer.Meta):
        fields = UserCreateSerializer.Meta.fields + [
            'partner_name',
            'partner_address',
            'inn',
            'owner_first_name',
            'owner_last_name',
            'owner_surname',
            'owner_birthday',
        ]

    def validate(self, attrs):
        # Разделяем поля профиля партнёра и базовые поля пользователя
        profile_fields = {
            'partner_name': attrs.get('partner_name'),
            'partner_address': attrs.get('partner_address') or attrs.get('inn') or '',
            'inn': attrs.get('inn'),
            'owner_first_name': attrs.get('owner_first_name'),
            'owner_last_name': attrs.get('owner_last_name'),
            'owner_surname': attrs.get('owner_surname'),
            'owner_birthday': attrs.get('owner_birthday'),
        }
        base_attrs = {k: v for k, v in attrs.items() if k not in profile_fields}
        validated = super().validate(base_attrs)
        validated.update(profile_fields)
        return validated

    def create(self, validated_data):
        # Создаём пользователя и профиль партнёра
        inn = validated_data.pop('inn', '')
        profile_data = {
            'name': validated_data.pop('partner_name'),
            'inn': inn,
            'address': validated_data.pop('partner_address') or inn,
            'owner_first_name': validated_data.pop('owner_first_name'),
            'owner_last_name': validated_data.pop('owner_last_name'),
            'owner_surname': validated_data.pop('owner_surname', ''),
            'owner_birthday': validated_data.pop('owner_birthday'),
        }
        user = User.objects.create_user(**validated_data)
        PartnerProfile.objects.create(user=user, **profile_data)
        return user


class PasswordChangeRequestSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context.get('request').user
        try:
            validate_password(attrs['new_password'], user)
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        return attrs
