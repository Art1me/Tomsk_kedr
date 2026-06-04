from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trees', '0009_alter_trees_image_uploads'),
    ]

    operations = [
        migrations.AddField(
            model_name='trees',
            name='is_paid',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='trees',
            name='payment_id',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='trees',
            name='paid_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
