# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ganglia', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='host',
            name='host_ip',
            field=models.CharField(max_length=200),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='host',
            name='host_name',
            field=models.CharField(max_length=200),
            preserve_default=True,
        ),
    ]
