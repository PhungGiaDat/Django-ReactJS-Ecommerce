import os
import django

# Cấu hình Django trước khi import model
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # Đổi "backend" thành tên project thật của bạn
django.setup()

import pandas as pd
from django.core.wsgi import get_wsgi_application
import os
from decimal import Decimal
from django.contrib.auth.models import User
from order.models import Order
from product.models import Product
from inventory.models import StockEntry, Supplier
from payment.models import Invoice

# Thiết lập Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project.settings")  # Cập nhật tên project
application = get_wsgi_application()


# Lấy user admin làm người tạo
try:
    admin_user = User.objects.get(username="danielfung")
except User.DoesNotExist:
    print("⚠️ User 'danielfung' không tồn tại. Vui lòng tạo user hoặc đổi username.")
    exit()

# Lấy dữ liệu từ database
data = []
orders = Order.objects.all()

for order in orders:
    for item in order.order_items.all():
        stock_entry = StockEntry.objects.filter(product=item.product).first()
        supplier = stock_entry.supplier if stock_entry else None
        invoice = Invoice.objects.filter(order=order).first()
        
        # Tính toán giá bán
        purchase_price = stock_entry.purchase_price if stock_entry else 0
        selling_price = stock_entry.selling_price if stock_entry else purchase_price * Decimal(1.4)
        discount = invoice.discount_applied if invoice else 0
        final_price = selling_price  # Giá bán ra từng sản phẩm
        final_total = invoice.final_price if invoice else selling_price * item.quantity  # Tổng tiền hóa đơn sau giảm giá
        
        data.append({
            "Tên khách hàng": order.customer.name,
            "Số lượng": item.quantity,
            "Tên sản phẩm": item.product.name,
            "Giá nhập": purchase_price,
            "Lợi nhuận 40%/chiếc": purchase_price * Decimal(0.4),
            "Giá 1 sản phẩm": selling_price,
            "Giá hóa đơn": final_total,
            "Chiết khấu": discount,
            "Giá giảm": final_total - (selling_price * item.quantity),
            "Giá bán được": final_total,
            "Ngày bán": order.created_at.strftime("%Y-%m-%d"),
            "Số điện thoại": order.customer.phone,
            "Địa chỉ": order.customer.address,
            "Quận": order.customer.district,
            "Email": order.customer.email,
            "Tổng giá nhập": purchase_price * item.quantity,
            "Tên thương hiệu": item.product.categories.name,
            "Nhà cung cấp": supplier.name if supplier else "N/A",
            "Final Price": final_price,
            "Final Total": final_total
        })

# Chuyển thành DataFrame
df = pd.DataFrame(data)

# Xuất ra file Excel
excel_filename = "export_orders.xlsx"
df.to_excel(excel_filename, index=False)

print(f"✅ Xuất file thành công: {excel_filename}")
