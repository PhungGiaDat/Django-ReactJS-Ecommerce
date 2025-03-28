from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from product.models import *
from order.models import *
from payment.models import *
from user.models import *
from inventory.models import *




# ------ User API ------ #

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
        user = User.objects.filter(email=value).exists()
        if user:
            raise serializers.ValidationError("A user with this email is already exist")
        return value


# ---- Inventory App API ---- #

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_info']


# API của bảng Stock
class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['id', 'quantity']


# API của bảng StockEntry
class StockEntrySerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)

    class Meta:
        model = StockEntry
        fields = ['id', 'purchase_price', 'selling_price', 'quantity', 'purchase_date', 'supplier']


# API của bảng StockTransaction
class StockTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransaction
        fields = ['id', 'transaction_type', 'quantity', 'timestamp']


# ------ Product APP API ------ #

class SizeSerializer(serializers.ModelSerializer):
    """Serializer cho size của sản phẩm"""
    product_type = serializers.StringRelatedField()  # Hoặc dùng `SlugRelatedField`

    class Meta:
        model = Size
        fields = ["id", "size", "product_type"]  # Thêm product_type
        
        
''' API của bảng Product'''
class ProductSerializer(serializers.ModelSerializer):
    """Serializer cho Product, tạo Stock, StockEntry, StockTransaction khi thêm sản phẩm"""

    sizes = serializers.PrimaryKeyRelatedField(queryset=Size.objects.all(), many=True)
    categories = serializers.SlugRelatedField(slug_field="name", queryset=Categories.objects.all())
    shoe_type = serializers.ChoiceField(choices=Product.SHOE_TYPE_CHOICES, required=False, allow_null=True)
    quantity = serializers.IntegerField(write_only=True, required=True)  # Số lượng nhập kho
    sizes_detail = SizeSerializer(source="sizes", many=True, read_only=True)  # Chi tiết size

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "slug", "created_at", "updated_at",
            "image", "created_by", "updated_by", "categories", "sizes", "sizes_detail",
            "shoe_type", "quantity"
        ]
        extra_kwargs = {
            "created_by": {"read_only": True},
            "updated_by": {"read_only": True},
            "slug": {"read_only": True},
        }

    def create(self, validated_data):
        """Tạo Product + cập nhật Stock, StockEntry, StockTransaction"""
        quantity = validated_data.pop("quantity")
        sizes = validated_data.pop("sizes", [])

        product = Product.objects.create(**validated_data)
        product.sizes.set(sizes)  # Gán danh sách sizes cho sản phẩm

        # 1️⃣ Tạo Stock
        stock = Stock.objects.create(product=product, quantity=quantity)

        # 2️⃣ Tạo StockEntry (Nhập kho)
        StockEntry.objects.create(
            product=product,
            quantity=quantity,
            purchase_price=validated_data.get("price", 0),
            selling_price=validated_data.get("price", 0),
        )

        # 3️⃣ Tạo StockTransaction (Ghi nhận giao dịch nhập kho)
        StockTransaction.objects.create(
            product=product,
            transaction_type="IN",
            quantity=quantity,
        )

        return product

    def update(self, instance, validated_data):
        """Cập nhật Product + số lượng tồn kho nếu thay đổi"""
        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get("description", instance.description)
        instance.price = validated_data.get("price", instance.price)
        instance.image = validated_data.get("image", instance.image)
        instance.categories = validated_data.get("categories", instance.categories)

        # Cập nhật số lượng trong Stock nếu có thay đổi
        new_quantity = validated_data.get("quantity", instance.quantity)
        if new_quantity != instance.quantity:
            stock = Stock.objects.get(product=instance)
            stock.quantity = new_quantity
            stock.save()

        instance.quantity = new_quantity
        instance.save()
        return instance


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
        
# API trả về thông tin bảng Categories
class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ['ID', 'name', 'created_by', 'updated_by']
        extra_kwargs = {'created_by': {'read_only': True}, 'updated_by': {'read_only': True}}
        
        
        
# ---- Customer App API ---- #
        
# API trả về thông tin bảng Customer 
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id','user','full_name','phone_number','email',
                  'created_at','updated_at']

# API của bảng Invoice 
class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id','order'
                'amount_paid','discount','final_price',
                'payment_method','payment_method_display','paid_at']
        
    def get_payment_method_display(self,object):
        return object.get_payment_method_display()
        