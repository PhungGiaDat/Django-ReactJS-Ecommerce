from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from product.models import Product, Categories

class UserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}
        
    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        return user
    
class AdminUseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','is_staff','is_superuser','date_joined']
        extra_kwargs = {'password': {'write_only': True, 'required': True},
                        'is_staff': {'default': True},
                        'is_superuser': {'default': True},}
        
    def create(self,validated_data):
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        return user
    
    def update(self,instance,validated_data):
        password = validated_data.pop('password',None)
        for attr, value in validated_data.items():
            setattr(instance,attr,value)
        if password:
            instance.set_password(password) 
        instance.save()
        
        return instance
    
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'created_at', 'updated_at', 'image', 'created_by', 'updated_by', 'categories']
        extra_kwargs = {'created_by': {'read_only': True}, 'updated_by': {'read_only': True}}
        
class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ['ID', 'name']
        
