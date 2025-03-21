from django.db import models
from django.contrib.auth.models import User
from product.models import Product
from user.models import Customer
# Create your models here.


class Cart(models.Model):
    ID = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user}"

    def total_price(self):
        return sum(item.product.price * item.quantity for item in self.items.all())
    
class CartItem(models.Model):
    cart = models.ForeignKey(Cart,on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart of {self.cart.user.username}"


# order của khách hàng 
class Order(models.Model):
    
    class OrderStatus(models.TextChoices):
        PENDING = "PENDING",("Đang chờ xử lý")
        PROCESSING = "PROCESSING",("Đang xử lý")
        SHIPPED = "SHIPPED",("Đã giao hàng")
        DELIVERED = "DELIVERED",("Đã nhận hàng")
        CANCELED = "CANCELED",("Đã hủy")
        
    class OrderType(models.TextChoices):
        ONLINE = "ONLINE",("Đặt hàng online")
        OFFLINE = "OFFLINE",("Đặt hàng tại cửa hàng")    
     
    order_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE,related_name= "order", null= True,blank=True)
    total_price= models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20,choices=OrderStatus.choices,default=OrderStatus.PENDING)
    order_type = models.CharField(max_length=20,choices=OrderType.choices,default=OrderType.ONLINE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        customer_name = self.customer.full_name if self.customer else "Khách vãng lai"
        return f"Order {self.order_id} of {self.customer.full_name}"
    
# Lưu thông tin chi tiết khi quản lý bán hàng về các giá và số lượng
class OrderDetails(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_details")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="order_details")
    quantity = models.PositiveIntegerField(default=1)
    price_sold = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    
    def save(self, *args, **kwargs):
        self.final_price = self.price_sold * (1 - float(self.discount) / 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} trong đơn hàng {self.order.order_id}"
    
    
class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('order', 'product')  # Đảm bảo mỗi sản phẩm chỉ xuất hiện 1 lần trong đơn hàng

    def __str__(self) -> str:
        return f"{self.product.name} (x{self.quantity})"

    def get_total_price(self) -> float:
        return self.product.price * self.quantity


    
