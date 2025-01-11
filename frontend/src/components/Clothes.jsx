import React, { useEffect, useState } from "react";
import publicAPI from "../publicAPI";
import '../styles/products.css';

function Product() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Gọi API để lấy dữ liệu
    useEffect(() => {
        publicAPI.get("/api/products/public", {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(res => {
            console.log(res.data);
            setProducts(res.data);

            // Lọc các sản phẩm thuộc danh mục "Giày Bóng Đá"
            const filtered = res.data.filter(product => product.categories === "Áo Bóng Đá");
            setFilteredProducts(filtered);
        })
        .catch(err => {
            console.log(err.message);
        });
    }, []); // Chỉ gọi API một lần khi component mount

    return (
        <section>
            <h1 className="text-center">QUẦN ÁO THỂ THAO</h1>
            <div className="container">
                <div className="row">
                    {filteredProducts.map(product => {
                        const imageUrl = product.image;
                        // Format giá tiền
                        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);

                        return (
                            <div className="col-md-4" key={product.id}>
                                <div className="card mb-4">
                                    {/* Hiển thị hình ảnh */}
                                    <picture>
                                        <source srcSet={imageUrl} type="image/webp" />
                                        <img src={imageUrl || "/default-image.jpg"} alt={product.name} 
                                           className="product-image" />
                                    </picture>

                                    {/* Nội dung sản phẩm */}
                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="card-text text-danger">
                                            Giá: {formattedPrice}
                                        </p>
                                        <button className="btn btn-primary">Xem chi tiết</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>        
    );
}

export default Product;
