"""Основные настройки Django-проекта."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def env_list(name, default=''):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(',') if item.strip()]


def env_bool(name, default=False):
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {'1', 'true', 'yes', 'on'}


SECRET_KEY = os.getenv(
    'DJANGO_SECRET_KEY',
    'django-insecure-ys^r=vca2j)oa$2u-zl*oz*aeyz4k=+*831%!jx^$z&5d%l-6c',
)
DEBUG = env_bool('DJANGO_DEBUG', True)

_default_allowed_hosts = (
    '127.0.0.1,localhost,tomskstolicakedra.red.tpu.ru'
)
ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', _default_allowed_hosts)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'phonenumber_field',
    'rest_framework',
    'rest_framework.authtoken',
    'djoser',
    'api',
    'trees',
    'promocodes',
    'News',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Tomsk_kedr.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Tomsk_kedr.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'api.User'
AUTHENTICATION_BACKENDS = ('api.backends.AuthBackend',)

_default_cors_origins = (
    'http://localhost:3000,http://127.0.0.1:3000,'
    'http://localhost:5173,http://127.0.0.1:5173,'
    'http://localhost:5174,http://127.0.0.1:5174'
    if DEBUG
    else 'http://tomskstolicakedra.red.tpu.ru,https://tomskstolicakedra.red.tpu.ru'
)
_dev_cors_origins = env_list('DJANGO_DEV_CORS_ALLOWED_ORIGINS', _default_cors_origins)
_configured_cors_origins = env_list('DJANGO_CORS_ALLOWED_ORIGINS', _default_cors_origins)
_configured_csrf_origins = env_list('DJANGO_CSRF_TRUSTED_ORIGINS', _default_cors_origins)

CORS_ALLOWED_ORIGINS = list(dict.fromkeys(
    _configured_cors_origins + (_dev_cors_origins if DEBUG else [])
))
CORS_ALLOWED_ORIGIN_REGEXES = (
    [
        r'^http://localhost:\d+$',
        r'^http://127\.0\.0\.1:\d+$',
    ]
    if DEBUG
    else []
)
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(
    _configured_csrf_origins + (_dev_cors_origins if DEBUG else [])
))

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FileUploadParser',
    ],
}

DJOSER = {
    'SERIALIZERS': {
        'user_create': 'api.serializers.UserCreateSerializer',
        'user': 'api.serializers.UserUpdateSerializer',
        'current_user': 'api.serializers.UserUpdateSerializer',
        'activation': 'djoser.serializers.ActivationSerializer',
    },
    'LOGIN_FIELD': 'username',
    'PERMISSIONS': {
        'user_create': ['rest_framework.permissions.AllowAny'],
        'user': ['rest_framework.permissions.IsAuthenticated'],
        'user_list': ['rest_framework.permissions.IsAuthenticated'],
        'activation': ['rest_framework.permissions.AllowAny'],
        'resend_activation': ['rest_framework.permissions.AllowAny'],
    },
    'VIEWSET': 'api.views.CustomUserViewSet',
    'ACTIVATION_URL': 'api/users/activate/{uid}/{token}/',
    'SEND_ACTIVATION_EMAIL': True,
    'SEND_CONFIRMATION_EMAIL': False,
    'PASSWORD_RESET_CONFIRM_URL': os.getenv(
        'DJOSER_PASSWORD_RESET_CONFIRM_URL',
        'password-reset/{uid}/{token}/',
    ).strip(),
    'PASSWORD_RESET_CONFIRM_RETYPE': False,
    'USERNAME_RESET_CONFIRM_URL': 'api/email/reset/confirm/{uid}/{token}/',
    'EMAIL_FRONTEND_URL': os.getenv(
        'DJOSER_EMAIL_FRONTEND_URL',
        (
            'http://127.0.0.1:8000/api/users/activate/{uid}/{token}/'
            if DEBUG
            else 'https://tomskstolicakedra.red.tpu.ru/api/users/activate/{uid}/{token}/'
        ),
    ).strip(),
    'USER_CREATE_PASSWORD_RETYPE': False,
    'SET_PASSWORD_RETYPE': False,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': False,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': False,
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.yandex.ru'
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = 'artemijezahidov@yandex.ru'
EMAIL_HOST_PASSWORD = 'ylkvxohfpqdhwjht'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
SERVER_EMAIL = EMAIL_HOST_USER
EMAIL_ADMIN = EMAIL_HOST_USER

YOOKASSA_SHOP_ID = os.getenv('YOOKASSA_SHOP_ID', '').strip()
YOOKASSA_SECRET_KEY = os.getenv('YOOKASSA_SECRET_KEY', '').strip()
YOOKASSA_RETURN_URL = os.getenv(
    'YOOKASSA_RETURN_URL',
    'http://localhost:3000/' if DEBUG else 'https://tomskstolicakedra.red.tpu.ru/',
).strip()
YOOKASSA_WEBHOOK_TOKEN = os.getenv('YOOKASSA_WEBHOOK_TOKEN', '').strip()
YOOKASSA_DEFAULT_AMOUNT = os.getenv('YOOKASSA_DEFAULT_AMOUNT', '300.00').strip()

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_X_FORWARDED_HOST = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
