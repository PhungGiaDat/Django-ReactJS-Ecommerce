from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from product.models import Product, Categories,Size

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
    
    sizes = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'slug','price', 'created_at', 'updated_at', 
                  'image', 'created_by', 'updated_by', 'categories', 'sizes', 'quantity']
        extra_kwargs = {'created_by': {'read_only': True},
                        'updated_by': {'read_only': True},
                        'slug':{'read_only':True}}
        
        
    def create(self, validated_data):
        product = Product.objects.create(**validated_data)
        return product
    
    def delete(self, validated_data):
        product = Product.objects.delete(**validated_data)
        return product
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.price = validated_data.get('price', instance.price)
        instance.image = validated_data.get('image', instance.image)
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.categories = validated_data.get('categories', instance.categories)
        instance.save()
        return instance
        
    def get_sizes(self, product):
        return SizeSerializer(product.sizes.all(), many=True).data


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['size']
        

class SimilarProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'slug']  # Chỉ chọn các trường cần thiết

# API để lấy chi tiết sản phẩm và sản phẩm tương tự 
class DetailedProductSerializer(serializers.ModelSerializer):
    similar_products = serializers.SerializerMethodField() # gọi hàm get_similar_products khi api được gọi
    product_sizes = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'slug', 'price', 'created_at', 'updated_at', 
                  'image', 'created_by', 'updated_by', 'categories', "product_sizes", 'quantity', 'similar_products']

    def get_similar_products(self, product):
        products = Product.objects.filter(categories=product.categories).exclude(id=product.id)[:5]
        return SimilarProductSerializer(products, many=True).data  # Serialize danh sách
        
    def get_product_sizes(self, product):
        return SizeSerializer(product.sizes, many=True).data
        
    
class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ['ID', 'name']
        
