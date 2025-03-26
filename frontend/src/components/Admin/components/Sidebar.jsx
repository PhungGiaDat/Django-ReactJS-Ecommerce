import React, { useState } from "react";
import "../css/Sidebar.css";
import ProductManagement from "../pages/AdminProduct";
import CategoriesManagement from "../../Admin/pages/CategoriesManagement";
import Order from "../../Admin/pages/Order";

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
                {selectedPage === "home"}
                {selectedPage === "products" && <ProductManagement />}
                {selectedPage === "orders" && <Order />}
                {selectedPage === "categories" && <CategoriesManagement />}
                {selectedPage === "settings"}
            </div>
        </div>
    );
}

export default Sidebar;
