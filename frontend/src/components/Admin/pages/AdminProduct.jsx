import React, { useEffect, useState } from "react";
import publicAPI from "../../../api/publicAPI";
import privateAPI from "../../../api/SecureAPI";
import "../css/Productmanagent.css";

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        image: null,
        category: "",
        quantity: "",
    });

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await publicAPI.get("/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await publicAPI.get("/api/public/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleFileChange = (e) => {
        setNewProduct({ ...newProduct, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("description", newProduct.description);
        formData.append("price", newProduct.price);
        formData.append("category", newProduct.category);
        formData.append("quantity", newProduct.quantity);
        if (newProduct.image) {
            formData.append("image", newProduct.image);
        }

        try {
            await privateAPI.post("/api/products/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Thêm sản phẩm thành công");
            setNewProduct({
                name: "",
                description: "",
                price: "",
                image: null,
                category: "",
                quantity: "",
            });
            fetchProducts();
        } catch (error) {
            alert("Thêm sản phẩm thất bại");
            console.error("Error creating product", error);
        }
    };

    return (
        <div className="product-management">
            <h2 className="product-title">Quản lý sản phẩm</h2>

            <form className="product-form" onSubmit={handleSubmit}>
                <label>
                    Tên sản phẩm:
                    <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} required />
                </label>

                <label>
                    Mô tả:
                    <textarea name="description" value={newProduct.description} onChange={handleInputChange} required />
                </label>

                <label>
                    Giá:
                    <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} required />
                </label>

                <label>
                    Danh mục:
                    <select name="category" value={newProduct.category} onChange={handleInputChange} required>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((category) => (
                            <option key={category.ID} value={category.ID}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Số lượng:
                    <input type="number" name="quantity" value={newProduct.quantity} onChange={handleInputChange} required />
                </label>

                <label>
                    Ảnh sản phẩm:
                    <input type="file" name="image" onChange={handleFileChange} />
                </label>

                <button className="submit-button" type="submit">Thêm sản phẩm</button>
            </form>

            <h2 className="product-list-title">Danh sách sản phẩm</h2>
            <ul className="product-list">
                {products.map((product) => (
                    <li className="product-item" key={product.id}>
                        <strong>{product.name}</strong> - {product.price}$
                        <br />
                        <span className="product-category">Danh mục: {product.categories?.name || "N/A"}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductManagement;
