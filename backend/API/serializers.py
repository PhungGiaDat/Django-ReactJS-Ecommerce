from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from product.models import Product, Categories

''' API dùng khi đăng ký tài khoản user'''
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
            
''' API dùng khi đăng ký tài khoản admin'''
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','is_staff','is_superuser','date_joined']
        extra_kwargs = {'password': {'write_only': True, 'required': True},
                        'is_staff': {'default': True},
                        'is_superuser': {'default': True},}
        
    def create(self,validated_data):
        validated_data.setdefault('is_staff',True)
        validated_data.setdefault("is_superuser",True)
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        return user
    
    def update(self,instance,validated_data):
        password = validated_data.pop('password',None)
        if password == " ":
            raise serializers.ValidationError("Password cannot be blank")
        for attr, value in validated_data.items():
            setattr(instance,attr,value)
        if password:
            instance.set_password(password) 
        instance.save()
        
        return instance

    def validate_email(self,value):
        user = User.objects.filter(email=value).exitst()
        if user:
            raise serializers.ValidationError("A user with this email is already exist")
        return value

    

''' API của bảng Product'''
class ProductSerializer(serializers.ModelSerializer):

    # Lấy về du lieu categories bằng tên thay vì ID
    categories = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Categories.objects.all()
    )
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'slug','price','size','color','quantity','type','created_at', 'updated_at', 
                  'image', 'created_by', 'updated_by', 'categories']
        extra_kwargs = {'created_by': {'read_only': True},
                        'updated_by': {'read_only': True},
                        'slug':{'read_only':True}}
class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ['ID', 'name']
        
