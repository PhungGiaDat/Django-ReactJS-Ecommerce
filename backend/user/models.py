from django.db import models
from django.contrib.auth.models import User



class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    image = models.ImageField(upload_to='profile/', null=True, blank=True)
    facebook_link = models.URLField(max_length=255, null=True, blank=True)
    
    
    def __str__(self):
        return self.user.username
