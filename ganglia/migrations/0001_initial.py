# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Host',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('host_name', models.CharField(default=b'ubuntu', max_length=200)),
                ('host_ip', models.CharField(default=b'0.0.0.0', max_length=200)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Metric',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('metric_name', models.CharField(max_length=200)),
                ('mtr_hostname', models.CharField(max_length=200)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('res_hostname', models.CharField(max_length=200)),
                ('res_name', models.CharField(max_length=200)),
                ('res_type', models.CharField(default=b'hardware', max_length=200)),
                ('host', models.ForeignKey(to='ganglia.Host')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='metric',
            name='resource',
            field=models.ForeignKey(to='ganglia.Resource'),
            preserve_default=True,
        ),
    ]
