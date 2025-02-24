from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.contrib.humanize.templatetags.humanize import intcomma
# Create your models here.

class Categories(models.Model):
    ID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ['ID']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("_detail", kwargs={"pk": self.pk})

class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255,unique=True) 
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    size = models.CharField(max_length=255,default="40")
    size_choices = [
        '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'
    ]
    clothes_size_choices = [ 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    color = models.CharField(max_length=255,default="black")
    quantity = models.IntegerField(default=1)    
    type = models.CharField(max_length=255,default="IC")
    created_by = models.ForeignKey(User, on_delete=models.PROTECT,related_name="created_by_user")
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT,related_name="updated_by_user")
    categories = models.ForeignKey(Categories,on_delete=models.CASCADE,related_name="products")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("_detail", kwargs={"pk": self.pk})

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            unique_slug = base_slug
            counter = 1
            while Product.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def formatted_price(self):
        return f"{intcomma(self.price):,} VNĐ"

    product_limit = 5
    def get_related_products(self,limit=product_limit):
        return Product.objects.filter(categories=self.categories).exclude(id=self.id)[:limit]



