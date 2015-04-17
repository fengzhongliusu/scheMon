from django import template

register = template.Library()

@register.filter(name='repl')
def repl(value,arg):
	return value.replace(arg,"_")
	
