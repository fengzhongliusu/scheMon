# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ganglia', '0003_auto_20150115_0249'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='res_related',
            field=models.TextField(default=b''),
            preserve_default=True,
        ),
    ]
