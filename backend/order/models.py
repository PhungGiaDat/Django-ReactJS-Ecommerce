from django.db import models
from django.contrib.auth.models import User
from product.models import Product
from user.models import Customer
from django.utils.timezone import now 
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
    created_at = models.DateTimeField(default=now)
    status = models.CharField(max_length=20,choices=OrderStatus.choices,default=OrderStatus.PENDING)
    order_type = models.CharField(max_length=20,choices=OrderType.choices,default=OrderType.ONLINE)
    
    
    def __str__(self):
        customer_name = self.customer.full_name if self.customer else "Khách vãng lai"
        return f"Order {self.order_id} of {customer_name}"
    
# Lưu thông tin chi tiết khi quản lý bán hàng về các giá và số lượng
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_sold = models.DecimalField(max_digits=10, decimal_places=2)  # Giá bán thực tế tại thời điểm đặt hàng
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # % giảm giá
    final_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False,default=0)  # Giá đã giảm (1 sp)
    final_total = models.DecimalField(max_digits=12, decimal_places=2, editable=False,default=0)  # Tổng giá của sp đó trong đơn
    created_at = models.DateTimeField(default=now)  # Thêm default để tạo migration
    class Meta:
        unique_together = ('order', 'product')
        verbose_name = "Chi tiết đơn hàng"
        verbose_name_plural = "Chi tiết đơn hàng"

    def save(self, *args, **kwargs):
        # Tính giá sau khi áp dụng giảm giá
        self.final_price = self.price_sold * (1 - self.discount / 100)
        # Tổng tiền = final_price * quantity
        self.final_total = self.final_price * self.quantity
        super().save(*args, **kwargs)
       

    def __str__(self):
        return f"{self.product.name} x {self.quantity} trong đơn hàng {self.order.order_id}"

    def get_total_price(self):
        return self.final_price * self.quantity


    
