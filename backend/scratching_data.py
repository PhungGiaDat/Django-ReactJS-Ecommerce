import requests
from bs4 import BeautifulSoup
import pandas as pd
import os

# URL của trang cần cào
URL = "https://thanhhungfutsal.com/collections/giay-futsal"

# Headers để giả lập trình duyệt
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Đường dẫn file Excel
file_path = "scraped_data.xlsx"

def get_product_data():
    """Cào dữ liệu sản phẩm từ Thanh Hùng Futsal"""
    response = requests.get(URL, headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    
    if response.status_code == 200:
        
        # Lặp qua các sản phẩm
        # for item in soup.find_all("div", class_="mustbuy__item"):
        #     try:
        #         # Lấy tên sản phẩm
        #         name = item.find("h2").text.strip()

        #         # Lấy giá khuyến mãi (nếu có)
        #         price_element = item.find("ins", class_="ega-text--no-underline")
        #         if price_element:
        #             price = int(price_element.text.replace("₫", "").replace(",", ""))
        #         else:
        #             price = None

        #         # Lấy giá gốc thực tế
        #         fundiin_element = item.find("div", class_="fundiin_block-render-ui__loop")
        #         if fundiin_element:
        #             original_price = int(fundiin_element["data-fundiin-loop-product-price-origin"])
        #         else:
        #             original_price = price if price else 0

        #         # Tính toán các giá trị
        #         purchase_price = original_price
        #         profit = purchase_price * 0.2
        #         selling_price = purchase_price + profit

        #         products.append([name, original_price, purchase_price, profit, selling_price])

        #     except Exception as e:
        #         print(f"Lỗi khi lấy dữ liệu sản phẩm: {e}")
                
                
        
        for item in soup.find_all("div", class_="pd-item_wrapper"):
            try:
                print("đang cào dữ liệu",item)
                # Lấy tên sản phẩm
                name = item.find("h2").text.strip()

                # Lấy giá gốc từ data attribute (nếu có)
                fundiin_element = item.find("div", class_="fundiin_block-render-ui__loop")
                if fundiin_element:
                    original_price = int(fundiin_element["data-fundiin-loop-product-price-origin"])
                else:
                    original_price = 0  # Mặc định 0 nếu không tìm thấy

                # Tính toán các giá trị
                purchase_price = original_price  # Giá nhập chính là giá gốc
                profit = int(purchase_price * 0.2)  # Lợi nhuận 20% giá nhập
                selling_price = purchase_price + profit  # Giá bán = Giá nhập + Lợi nhuận

                products.append([name, original_price, purchase_price, profit, selling_price])

            except Exception as e:
                print(f"Lỗi khi lấy dữ liệu sản phẩm: {e}")


    return products

def update_excel(products):
    """Cập nhật dữ liệu mới vào file Excel mà không ghi đè dữ liệu cũ"""
    new_data = pd.DataFrame(products, columns=["Tên sản phẩm", "Giá gốc", "Giá nhập", "Lợi nhuận", "Giá bán"])
    
    # Kiểm tra nếu file đã tồn tại
    if os.path.exists(file_path):
        existing_data = pd.read_excel(file_path)
        updated_data = pd.concat([existing_data, new_data], ignore_index=True)
    else:
        updated_data = new_data  # Nếu file chưa tồn tại, chỉ lưu dữ liệu mới
    
    # Lưu vào file
    updated_data.to_excel(file_path, index=False, engine="openpyxl")
    print(f"✅ File đã được cập nhật với dữ liệu mới: {file_path}")

if __name__ == "__main__":
    product_data = get_product_data()
    if product_data:
        update_excel(product_data)
    else:
        print("Không có sản phẩm nào được cào.")
