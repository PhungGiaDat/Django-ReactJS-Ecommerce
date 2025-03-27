import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="list-group">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "list-group-item active" : "list-group-item"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? "list-group-item active" : "list-group-item"
            }
          >
            Sản phẩm
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "list-group-item active" : "list-group-item"
            }
          >
            Đơn Hàng
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? "list-group-item active" : "list-group-item"
            }
          >
            Danh Mục
          </NavLink>
          <NavLink
            to="/admin/pos"
            className={({ isActive }) =>
              isActive ? "list-group-item active" : "list-group-item"
            }
          >
            POS
          </NavLink>
        </div>
      </div>
      {/* Phần nội dung chính sẽ được render bởi Layout hoặc Outlet từ Router */}
      <div className="content">
        {/* Đây sẽ là nơi render các trang con theo route */}
      </div>
    </div>
  );
}

export default Sidebar;
