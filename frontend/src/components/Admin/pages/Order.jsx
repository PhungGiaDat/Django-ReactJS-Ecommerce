import React, { useEffect, useState } from "react";
import publicAPI from "../../../api/publicAPI";
import "../css/Order.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.get("/api/orders");
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders", err);
      setError("Có lỗi khi lấy dữ liệu đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  // Component hiển thị tóm tắt đơn hàng
  const OrderSummary = ({ orders }) => (
    <div className="order-summary">
      <h2 className="text">Order Summary</h2>
      <p>
        <strong>Total Orders:</strong> {orders.length}
      </p>
      <p>
        <strong>Pending Orders:</strong> {orders.filter(o => o.status === "Pending").length}
      </p>
      <p>
        <strong>Completed Orders:</strong> {orders.filter(o => o.status === "Completed").length}
      </p>
    </div>
  );

  // Component danh sách đơn hàng theo dạng list view
  const OrderList = ({ orders, onOrderClick }) => (
    <div className="order-list">
      <h2>Order List</h2>
      <ul>
        {orders.map((order) => (
          <li
            key={order._id}
            className="order-list-item"
            onClick={() => onOrderClick(order)}
          >
            Order #{order._id} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );

  // Component chi tiết đơn hàng
  const OrderDetails = ({ order }) => (
    <div className="order-details">
      <h2>Order Details</h2>
      <p>
        <strong>Order ID:</strong> {order._id}
      </p>
      <p>
        <strong>Customer:</strong> {order.customer}
      </p>
      <p>
        <strong>Total:</strong> ${order.total}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <h3>Products:</h3>
      <ul>
        {order.products && order.products.map((product) => (
          <li key={product._id}>
            <strong>{product.name}</strong> - Quantity: {product.quantity}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="order-container">
      <h1>Order Management</h1>

      {loading && <p className="center-text">Loading orders...</p>}
      {error && <p className="center-text error-text">{error}</p>}

      {!loading && !error && (
        <>
          <OrderSummary orders={orders} />
          <OrderList orders={orders} onOrderClick={handleOrderClick} />
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </>
      )}
    </div>
  );
};

export default OrderManagement;
