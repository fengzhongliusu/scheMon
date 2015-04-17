from django.contrib import admin
from ganglia.models import Resource,Metric,Host

# Register your models here.

class MetricInline(admin.TabularInline):
	model = Metric
class ResInline(admin.TabularInline):
	model = Resource

class HostAdmin(admin.ModelAdmin):
	fieldsets = [
	  ('hostname',	{'fields':['host_name']}),
	  ('host_ip',	{'fields':['host_ip']}),
	]
	inlines = [ResInline]
	list_display = ('host_name','host_ip')


class ResAdmin(admin.ModelAdmin):
	fieldsets = [
	   ('name',	{'fields':['res_name']}),
	   ('type',	{'fields':['res_type'],'classes':['collapse']}),
	   ('hostname',	{'fields':['res_hostname'],'classes':['collapse']}),
	   ('related',	{'fields':['res_related'],'classes':['collapse']}),
	]
	inlines = [MetricInline]
	list_display = ('res_name','res_type','res_hostname')


admin.site.register(Resource,ResAdmin)
admin.site.register(Host,HostAdmin)