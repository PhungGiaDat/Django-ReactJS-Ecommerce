from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils.text import slugify
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
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name="created_by_user")
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name="updated_by_user")
    categories = models.ForeignKey(Categories,on_delete=models.CASCADE,related_name="categories")
    
    class Meta:
        ordering = ['created_at']   

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("_detail", kwargs={"pk": self.pk})

    def save(self, *args, **kwargs):
        ''' Auto create slug when create product '''
        if not self.slug:
            self.slug = slugify(self.name)
            unique_slug = self.slug
            counter = 1 
            # Kiểm tra và tạo slug duy nhất
            while Product.objects.filter(slug=unique_slug).exists():
                unique_slug = '{}-{}'.format(self.slug, counter)
                counter += 1
            self.slug = unique_slug     

        super(Product, self).save(*args, **kwargs)

