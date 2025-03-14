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
    
# 1 product có nhiều size và 1 size thuộc nhiều products
class Size(models.Model):
    product_type = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name="sizes")
    size = models.CharField(max_length=10)  # Lưu cả số (giày) và chữ (áo)

    def __str__(self):
        return f"{self.size} ({self.product_type.name})"

class Product(models.Model):
    SHOE_TYPE_CHOICES = [
        ('TF', 'Turf (Sân cỏ nhân tạo)'),
        ('IC', 'Indoor (Futsal)'),
    ]
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
<<<<<<< HEAD
    quantity = models.PositiveIntegerField(default=1)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_by_user")
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="updated_by_user")
    categories = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name="products")
    sizes = models.ManyToManyField(Size, related_name="products")
    shoe_type = models.CharField(max_length=2, choices=SHOE_TYPE_CHOICES, blank=True, null=True)  # Thêm field shoe_type
    
=======
    created_by = models.ForeignKey(User, on_delete=models.PROTECT,related_name="created_by_user")
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT,related_name="updated_by_user")
    categories = models.ForeignKey(Categories,on_delete=models.CASCADE,related_name="products")
>>>>>>> b72250ee1bc51678a9ef05be12516c122ea51c8d

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



    