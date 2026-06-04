from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_partnerprofile_owner_first_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentWebhookEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider', models.CharField(default='yookassa', max_length=50)),
                ('event_type', models.CharField(blank=True, default='', max_length=100)),
                ('payload', models.JSONField()),
                ('received_at', models.DateTimeField(auto_now_add=True)),
                ('processed', models.BooleanField(default=False)),
            ],
        ),
    ]
