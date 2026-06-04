"""Кастомный backend авторизации по username/email/телефону."""
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class AuthBackend(object):
    # Настройки совместимости backend-а
    supports_anonymous_user = True
    supports_object_permission = False
    supports_inactive_user = False
    
    def get_user(self, user_id):
        # Получение пользователя по ID для сессий/авторизации
        try:
            return User.objects.get(pk=user_id)
        except:
            return None
    
    def authenticate(self, request, username, password):
        # Поиск пользователя по логину/почте/телефону и проверка пароля
        try:
            user = User.objects.get(
                Q(username__iexact=username)
                | Q(email__iexact=username)
                | Q(phone_number=username)
            )
        except User.DoesNotExist:
            return None
        return user if user.check_password(password) else None
