# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ganglia', '0002_auto_20150115_0248'),
    ]

    operations = [
        migrations.AlterField(
            model_name='resource',
            name='res_type',
            field=models.CharField(max_length=200),
            preserve_default=True,
        ),
    ]
