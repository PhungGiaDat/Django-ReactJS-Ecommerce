
from django.contrib import admin
from product.models import Product, Categories
from order.models import Order,OrderItem


admin.site.register(Product)
admin.site.register(Categories)
admin.site.register(Order)
admin.site.register(OrderItem)