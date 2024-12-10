
from django.contrib.auth.models import User
from rest_framework import serializers,generics
from API.serializers import ProductSerializer,CategoriesSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import Product,Categories
from rest_framework import status
from rest_framework.response import Response



class BaseUserOwnedView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        if serializer.is_valid() and status.HTTP_201_CREATED:
            serializer.save(created_by=self.request.user, updated_by=self.request.user)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
        
    def perform_destroy(self, instance):
        if instance.created_by != self.request.user:
            raise serializers.ValidationError({'error': 'You do not have permission to delete this object'})
        instance.delete()


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
