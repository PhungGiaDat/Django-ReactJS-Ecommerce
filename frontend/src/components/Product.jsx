import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../api";

function Product() {
    const [products, setProducts] = useState([]);

    // Gọi API để lấy dữ liệu
    useEffect(() => {
        api.get("/api/products/public")
            .then(res => {
                console.log(res.data);
                setProducts(res.data);
            })
            .catch(err => {
                console.log(err.message);
            });
    }, []);

    return (
        <section>
            <h1 className="text-center">SẢN PHẨM/HOT SALE</h1>
            <div className="container">
                <div className="row">
                    {products.map(product => (
                        <div className="col-md-4" key={product.id}>
                            <div className="card mb-4">
                                {/* Hiển thị hình ảnh */}
                                <img
                                    src={product.image || "/default-image.jpg"}
                                    alt={product.name}
                                    className="card-img-top"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                {/* Nội dung sản phẩm */}
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text text-danger">
                                        Giá: {product.price} VNĐ
                                    </p>
                                    <button className="btn btn-primary">Xem chi tiết</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Product;
