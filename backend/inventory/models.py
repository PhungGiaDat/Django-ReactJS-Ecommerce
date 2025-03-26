from django.db import models
from product.models import Product
from django.contrib.auth.models import User 
from django.dispatch import receiver
from django.db.models.signals import pre_save
from decimal import Decimal


# Stock - quản lý tồn kho

class Stock(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.product} - {self.quantity} units in stock"
    
    
class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_info = models.TextField(blank=True,null=True)
    
    def __str__(self):
        return self.name
    
# StockEntry - quản lý nhập hàng từ nhà cung cấp
    
class StockEntry(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10,decimal_places=2)
    quantity = models.IntegerField()
    purchase_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def save(self,*args, **kwargs): 
        # Nếu không có giá bán ,thì giá bán = giá mua * 0.4
        if not self.selling_price:
            self.selling_price = self.purchase_price * Decimal(0.4)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.quantity} units of {self.product} from {self.supplier}"
    
@receiver(pre_save, sender=StockEntry)
def save_price_history(sender, instance, **kwargs):
    # Kiểm tra nếu đây là một sản phẩm mới hay bản ghi mới 
    if instance.id is None:
        return
    
    try:
        # Lấy kết quả gần nhất của sản phẩm
        last_entry = StockEntry.objects.get(id=instance.id)
        
        # kiểm tra nếu giá nhập hoặc giá bán thay đổi 
        if instance.purchase_price != last_entry.purchase_price or instance.selling_price != last_entry.selling_price:
            # Lưu lại lịch sử trữ hàng cũ 
            StockEntry.objects.create(
                product = last_entry.product,
                supplier = last_entry.supplier,
                purchase_price = last_entry.purchase_price,
                selling_price = last_entry.selling_price,
                quantity = 0,
                purchase_date = last_entry.purchase_date,
                created_by = last_entry.created_by
            )
    except:
        pass
    
    
class StockTransaction(models.Model):
    TRANSACTION_TYPE = [
        ('IN','NHẬP KHO'),
        ('OUT','XUẤT KHO'),
        ('ADJ','ĐIỀU CHỈNH KHO')
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=3, choices=TRANSACTION_TYPE)
    quantity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.transaction_type} {self.quantity} units of {self.product}"