import React, { useState } from "react";
import "../css/Sidebar.css";
import ProductManagement from "../pages/AdminProduct";
import CategoriesManagement from "../../Admin/pages/CategoriesManagement";

function Sidebar() {
    const [selectedPage, setSelectedPage] = useState("home");

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="list-group">
                    <button className={`list-group-item ${selectedPage === "home" ? "active" : ""}`} onClick={() => setSelectedPage("home")}>Home</button>
                    <button className={`list-group-item ${selectedPage === "products" ? "active" : ""}`} onClick={() => setSelectedPage("products")}>Sản phẩm</button>
                    <button className={`list-group-item ${selectedPage === "orders" ? "active" : ""}`} onClick={() => setSelectedPage("orders")}>Đơn Hàng</button>
                    <button className={`list-group-item ${selectedPage === "categories" ? "active" : ""}`} onClick={() => setSelectedPage("categories")}>Danh Mục</button>
                    <button className={`list-group-item ${selectedPage === "settings" ? "active" : ""}`} onClick={() => setSelectedPage("settings")}>Settings</button>
                </div>
            </div>

            <div className="content">
                {selectedPage === "home" && <h2>Trang chủ</h2>}
                {selectedPage === "products" && <ProductManagement />}
                {selectedPage === "orders" && <h2>Đơn hàng</h2>}
                {selectedPage === "categories" && <CategoriesManagement />}
                {selectedPage === "settings" && <h2>Cài đặt</h2>}
            </div>
        </div>
    );
}

export default Sidebar;
