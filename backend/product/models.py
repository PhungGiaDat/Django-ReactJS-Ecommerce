from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.contrib.humanize.templatetags.humanize import intcomma
from django.db.models import Sum
from django.db.models.signals import post_save

# Create your models here.



    
class Categories(models.Model):
    ID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="categories_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="categories_updated")
    
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
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_by_user")
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="updated_by_user")
    categories = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name="products")
    sizes = models.ManyToManyField(Size, related_name="products")
    shoe_type = models.CharField(max_length=2, choices=SHOE_TYPE_CHOICES, blank=True, null=True)
    
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

    def get_latest_price(self):
        """Get the latest selling price from StockEntry"""
        latest_entry = self.stockentry_set.order_by('-purchase_date').first()
        return latest_entry.selling_price if latest_entry else None

    def formatted_price(self):
        price = self.get_latest_price()
        return f"{intcomma(price):,} VNĐ" if price else "N/A"

    product_limit = 5
    def get_related_products(self,limit=product_limit):
        return Product.objects.filter(categories=self.categories).exclude(id=self.id)[:limit]

    # # Lấy giá mua mới nhất thêm vào một trường dữ liệu mới
    # def get_latest_purchase_price(self):
    #     latest_stock_entry = StockEntry.objects.filter(product = self).order_by('-purchase_date').first()
    #     return latest_stock_entry.purchase_price if latest_stock_entry else None ## Trả về none nếu không có dữ liệu
    
    # # Cập nhật giá bán
    # def get_selling_price(self):
    #     latest_price = self.get_latest_purchase_price()
    #     return latest_price * 1.3 if latest_price else None ## Trả về none nếu không có dữ liệu

    
