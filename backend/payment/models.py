from django.db import models
from django.urls import reverse
from order.models import Order




# phương pháp thanh toán 
class PaymentMethod(models.TextChoices):
    CASH = "CASH",("Tiền mặt")
    CARD = "CREDIT CARD",("Thẻ tín dụng")
    BANK_TRANSFER = "BANK TRANSFER",("Chuyển khoản ngân hàng")
    E_WALLET = "E WALLET",("Ví điện tử")
    

    def __str__(self):
        return self.name

class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=12,decimal_places=2)
    discount = models.DecimalField(max_digits=10,decimal_places=2)
    final_price = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices,default=PaymentMethod.CASH)
    paid_at = models.DateTimeField(auto_now_add=True)
    
    def save(self,*args, **kwargs):
        self.final_price = self.amount_paid *(1 - self.discount/100)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Hóa đơn {self.id} - Order {self.order.order_id} - {self.get_payment_method_display()}"
    