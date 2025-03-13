import React, { useEffect, useState } from "react";
import publicAPI from "../publicAPI";
import '../styles/products.css';

function Product() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Gọi API để lấy dữ liệu
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true); // Đặt loading trước khi gọi API
            try {
                const res = await publicAPI.get("/api/products/public", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                setProducts(res.data);
                // Lọc các sản phẩm thuộc danh mục "Giày Bóng Đá"
                const filtered = res.data.filter(product => product.categories?.includes("Giày Bóng Đá"));
                setFilteredProducts(filtered);
            } catch (err) {
                console.log("Lỗi khi tải sản phẩm:", err.message);
            } finally {
                setLoading(false); // Luôn dừng loading dù thành công hay lỗi
            }
        };

        fetchProducts();
    }, []); // Chỉ gọi API một lần khi component mount

    return (
        <section>
            <h1 className="text-center">SẢN PHẨM/HOT SALE</h1>
            {loading ? (
                <p className="text-center">Đang tải dữ liệu...</p>
            ) : (
                <div className="container">
                    <div className="row">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => {
                                const imageUrl = product.image || "/default-image.jpg"; // Ảnh mặc định nếu không có ảnh
                                // Format giá tiền
                                const formattedPrice = new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(product.price);

                                return (
                                    <div className="col-md-4" key={product.id}>
                                        <div className="card mb-4">
                                            {/* Hiển thị hình ảnh */}
                                            <picture>
                                                <source srcSet={imageUrl} type="image/webp" />
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name || "Sản phẩm"}
                                                    className="product-image"
                                                />
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
                            })
                        ) : (
                            <p className="text-center">Không có sản phẩm nào.</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

export default Product;
