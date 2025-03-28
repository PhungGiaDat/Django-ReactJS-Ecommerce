import os
import sys
import pandas as pd
from decimal import Decimal
import django

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Khởi tạo Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # Cập nhật theo tên project
django.setup()

from product.models  import Product
from inventory.models import StockEntry, Stock, Supplier
from order.models import Order, OrderItem
from payment.models import Invoice
from user.models import Customer, Address
from django.contrib.auth.models import User
# Đọc file Excel
FILE_PATH = os.path.join(os.path.dirname(__file__), "selldata.xlsx")
df = pd.read_excel(FILE_PATH, sheet_name="Sheet1")


# Kiểm tra cột dữ liệu
print("Các cột trong file Excel:", df.columns)

# Lấy user admin làm người tạo
try:
    admin_user = User.objects.get(username="danielfung")
except User.DoesNotExist:
    print("⚠️ User 'admin' không tồn tại. Vui lòng tạo user hoặc đổi username.")
    exit()

# Import dữ liệu từ file Excel
for index, row in df.iterrows():
    # Tạo hoặc lấy khách hàng
    customer, _ = Customer.objects.get_or_create(
        full_name=row["Tên khách hàng"],
        phone_number=row["Số điện thoại"],
        defaults={"email": row.get("Email", None)},  # Tránh lỗi nếu thiếu cột email
    )

    # Tạo địa chỉ nếu có thông tin
    if pd.notna(row["Địa chỉ"]) and pd.notna(row["Quận"]):
        Address.objects.get_or_create(
            customer=customer,
            street=row["Địa chỉ"],
            district=row["Quận"],
            city="Hồ Chí Minh"  # Mặc định nếu không có cột city
        )

    # Tạo hoặc lấy sản phẩm
    product, _ = Product.objects.get_or_create(name=row["Tên sản phẩm"])

    # Tạo nhà cung cấp
    supplier, _ = Supplier.objects.get_or_create(name=row["Nhà cung cấp"])

    # Nhập kho
    stock_entry = StockEntry.objects.create(
        product=product,
        supplier=supplier,
        purchase_price=Decimal(row["Giá nhập"]),
        selling_price=Decimal(row["Giá 1 sản phẩm"]),
        quantity=int(row["Số lượng"]),
        created_by=admin_user,
    )

    # Cập nhật tồn kho
    stock, _ = Stock.objects.get_or_create(product=product)
    stock.quantity += int(row["Số lượng"])
    stock.save()

    # Tạo đơn hàng
    order = Order.objects.create(
        customer=customer,
        created_at=pd.to_datetime(row["Ngày bán"]),
        status="DELIVERED",
        order_type="ONLINE",
    )

    # Tính toán giá cuối cùng
    price_sold = Decimal(row["Giá 1 sản phẩm"])
    discount = Decimal(row["Chiết khấu"])
    final_price_per_item = price_sold * (1 - discount)  # Giá sau giảm
    total_final_price = final_price_per_item * int(row["Số lượng"])  # Tổng tiền

    # Tạo OrderItem
    order_item = OrderItem.objects.create(
        order=order,
        product=product,
        quantity=int(row["Số lượng"]),
        price_sold=price_sold,
        discount=discount,
        final_price=final_price_per_item,
        final_total=total_final_price,
    )

    # Tạo Invoice
    invoice = Invoice.objects.create(
        order=order,
        amount_paid=total_final_price,
        discount_applied=discount * 100,  # Lưu % giảm giá
        final_price=total_final_price,
        payment_method="CASH",
    )

print("🎉 Import dữ liệu hoàn tất!")
