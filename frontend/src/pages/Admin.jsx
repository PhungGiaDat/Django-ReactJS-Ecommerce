import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Admin/components/Sidebar/Sidebar";
import Header from "../components/Admin/components/Header/Header";
import "../styles/admin.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
