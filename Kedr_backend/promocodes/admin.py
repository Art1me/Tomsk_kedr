"""Админка для промокодов."""
from django import forms
from django.contrib import admin, messages
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.urls import path
from django.utils import timezone

from .models import Promocode


class PromocodeGenerateForm(forms.Form):
    count = forms.IntegerField(
        label='Количество промокодов',
        min_value=1,
        max_value=10000,
        initial=100,
        help_text='Можно создать от 1 до 10000 промокодов за один раз.',
    )


@admin.register(Promocode)
class PromocodeAdmin(admin.ModelAdmin):
    """Настройки отображения и генерации промокодов."""

    list_display = ('id', 'code', 'is_activated')
    list_filter = ('is_activated',)
    search_fields = ('code',)
    change_list_template = 'admin/promocodes/promocode/change_list.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'generate/',
                self.admin_site.admin_view(self.generate_promocodes_view),
                name='promocodes_promocode_generate',
            ),
            path(
                'export-inactive/',
                self.admin_site.admin_view(self.export_inactive_promocodes_view),
                name='promocodes_promocode_export_inactive',
            ),
        ]
        return custom_urls + urls

    def export_inactive_promocodes_view(self, request):
        codes = (
            Promocode.objects
            .filter(is_activated=False)
            .order_by('id')
            .values_list('code', flat=True)
        )
        content = '\n'.join(codes)
        if content:
            content += '\n'

        filename = timezone.now().strftime('inactive_promocodes_%Y-%m-%d_%H-%M-%S.txt')
        response = HttpResponse(content, content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    def generate_promocodes_view(self, request):
        if request.method == 'POST':
            form = PromocodeGenerateForm(request.POST)
            if form.is_valid():
                count = form.cleaned_data['count']
                generated_codes = set()
                promocodes = []

                while len(promocodes) < count:
                    code = Promocode.generate_unique_code()
                    if code in generated_codes:
                        continue

                    generated_codes.add(code)
                    promocodes.append(Promocode(code=code))

                Promocode.objects.bulk_create(promocodes)
                messages.success(
                    request,
                    f'Создано промокодов: {count}.',
                )
                return redirect('admin:promocodes_promocode_changelist')
        else:
            form = PromocodeGenerateForm()

        context = {
            **self.admin_site.each_context(request),
            'opts': self.model._meta,
            'title': 'Генерация промокодов',
            'form': form,
        }
        return render(request, 'admin/promocodes/promocode/generate.html', context)
