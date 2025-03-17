import {react, useEffect, useState } from "react";
import publicAPI from "../../../api/publicAPI";
import privateAPI from "../../../api/SecureAPI";
import "../css/CategoriesManagement.css";

function CategoriesManagement() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await publicAPI.get("http://localhost:8000/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let form = new FormData();

        form.append("name", newCategory.name);
        form.append("description", newCategory.description);

        try {
            await privateAPI.post("/api/categories", form);
            alert("Thêm danh mục thành công!");
            setNewCategory({ name: "", description: "" });
            fetchCategories();
        } catch (error) {
            alert("Thêm danh mục thất bại!");
            console.error("Error adding category", error);
        }
    };

    return (
        <div className="categories-management">
            <h1 className="categories-title">Quản lý danh mục</h1>

            <form className="categories-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Tên danh mục</label>
                    <input type="text" name="name" id="name" value={newCategory.name} onChange={handleInputChange} required />
                </div>

                <div>
                    <label htmlFor="description">Mô tả</label>
                    <input type="text" name="description" id="description" value={newCategory.description} onChange={handleInputChange} required />
                </div>

                <button className="submit-button" type="submit">Thêm danh mục</button>
            </form>

            <ul className="categories-list">
                {categories.map((category) => (
                    <li className="category-item" key={category.id}>
                        <h3>{category.name}</h3>
                        <p>{category.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CategoriesManagement;
