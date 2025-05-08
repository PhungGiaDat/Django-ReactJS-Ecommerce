from django.db import models
from django.contrib.auth.models import User



class Customer(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,null=True,blank=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=12)
    email = models.EmailField(unique=True,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # New fields for POS
    customer_type = models.CharField(
        max_length=20,
        choices=[
            ('REGULAR', 'Khách hàng thường xuyên'),
            ('WALK_IN', 'Khách vãng lai'),
        ],
        default='WALK_IN'
    )
    total_purchases = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_purchase_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    
    def __str__(self):
        return f"{self.full_name} - {self.phone_number}"

class Address(models.Model):
    customer = models.ForeignKey(Customer,on_delete=models.CASCADE)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    ward = models.CharField(max_length=255)
    
    
    def __str__(self):
        return f"{self.street}, {self.ward}, {self.district}, {self.city}"

    
    