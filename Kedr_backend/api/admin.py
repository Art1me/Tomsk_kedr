"""Настройки админ-панели для пользователей и профилей."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from api.models import PartnerProfile, SimpleUserProfile, User

admin.site.site_header = 'Администрирование Tomsk Kedr'
admin.site.site_title = 'Tomsk Kedr | Админ'
admin.site.index_title = 'Управление данными'


class SimpleUserProfileInline(admin.StackedInline):
    model = SimpleUserProfile
    can_delete = False
    max_num = 1

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Отображение модели пользователя в админке
    ordering = ('-id',)
    list_display = (
        'id',
        'username',
        'email',
        'phone_number',
        'is_active',
        'is_verified',
        'is_staff',
        'is_superuser',
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_verified')
    list_editable = ('is_active', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('id', 'username', 'email', 'phone_number')
    actions = ['make_superuser', 'remove_superuser']

    fieldsets = (
        (None, {'fields': ('username', 'email', 'phone_number', 'password')}),
        ('Права доступа', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'email',
                'phone_number',
                'password1',
                'password2',
                'is_active',
                'is_verified',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),
        }),
    )
    inlines = [SimpleUserProfileInline]

    @admin.action(description='Сделать суперпользователем')
    def make_superuser(self, request, queryset):
        queryset.update(is_superuser=True, is_staff=True, is_active=True)

    @admin.action(description='Снять права суперпользователя')
    def remove_superuser(self, request, queryset):
        queryset.update(is_superuser=False)

    def save_model(self, request, obj, form, change):
        if obj.is_superuser:
            obj.is_staff = True
            obj.is_active = True
        super().save_model(request, obj, form, change)



@admin.register(SimpleUserProfile)
class SimpleUserProfileAdmin(admin.ModelAdmin):
    # Отображение профиля обычного пользователя в админке
    list_display = ('id', 'user', 'first_name', 'last_name', 'is_editor')
    list_editable = ('is_editor',)
    list_filter = ('is_editor',)
    search_fields = ('user__email', 'first_name', 'last_name')
    actions = ['make_editor', 'remove_editor']

    @admin.action(description='Сделать редактором')
    def make_editor(self, request, queryset):
        queryset.update(is_editor=True)

    @admin.action(description='Снять редактора')
    def remove_editor(self, request, queryset):
        queryset.update(is_editor=False)


@admin.register(PartnerProfile)
class PartnerProfileAdmin(admin.ModelAdmin):
    # Отображение профиля партнёра в админке
    list_display = (
        'id',
        'user',
        'name',
        'inn',
        'address',
        'owner_first_name',
        'owner_last_name',
        'owner_surname',
        'owner_birthday',
    )
    list_filter = ('user__is_active', 'user__is_verified')
    search_fields = ('user__email', 'name', 'inn')
