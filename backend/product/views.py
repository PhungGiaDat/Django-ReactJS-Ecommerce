
from rest_framework import serializers,generics
from API.serializers import ProductSerializer,CategoriesSerializer,DetailedProductSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import Product,Categories
from rest_framework import status
from rest_framework.response import Response
from core.views import BaseUserOwnedView



class Categories_Public_List_View(generics.ListAPIView):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer
    permission_classes = [AllowAny]
class Categories_List_Create(BaseUserOwnedView,generics.ListCreateAPIView):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer
   
class Categories_Delete(BaseUserOwnedView,generics.DestroyAPIView):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer
    
class Categories_Update(BaseUserOwnedView,generics.RetrieveUpdateAPIView):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer
    
class Product_List_Create(BaseUserOwnedView,generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
class Product_Delete(BaseUserOwnedView,generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
class Product_Update(BaseUserOwnedView,generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class Product_List_View(BaseUserOwnedView,generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class Product_Public_List_View(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
class Product_Public_View(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = DetailedProductSerializer
    permission_classes = [AllowAny]

class Product_Detail_View(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = DetailedProductSerializer
    permission_classes = [AllowAny]  # Cho phép mọi người truy cập công khai



