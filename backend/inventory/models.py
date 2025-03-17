from django.db import models
from product.models import Product
from django.contrib.auth.models import User 


# Stock - quản lý tồn kho

class Stock(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.product} - {self.quantity} units in stock"
    
# StockEntry - quản lý nhập hàng từ nhà cung cấp
    
class StockEntry(models.Model):
    Product = models.ForeignKey(Product, on_delete=models.CASCADE)
    supplier = models.CharField(max_length=255)
    purchase_price = models.FloatField()
    quantity = models.IntegerField()
    purchase_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.quantity} units of {self.Product} from {self.supplier}"
    
class StockTransaction(models.Model):
    TRANSACTION_TYPE = [
        ('IN','NHẬP KHO'),
        ('OUT','XUẤT KHO')
        ('ADJ','ĐIỀU CHỈNH KHO')
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=3, choices=TRANSACTION_TYPE)
    quantity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.transaction_type} {self.quantity} units of {self.product}"