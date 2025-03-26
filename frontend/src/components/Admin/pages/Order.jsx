import React, { useEffect, useState } from "react";
import publicAPI from "../../../api/publicAPI";

function Order() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await publicAPI.get("/api/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div>
      <h1>Order Management</h1>
      {/* Order Summary Section */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <h2>Order Summary</h2>
        <p><strong>Total Orders:</strong> {orders.length}</p>
        <p><strong>Pending Orders:</strong> {orders.filter(order => order.status === "Pending").length}</p>
        <p><strong>Completed Orders:</strong> {orders.filter(order => order.status === "Completed").length}</p>
      </div>

      {/* List of Orders as Buttons */}
      <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {orders.map((order) => (
          <button
            key={order._id}
            onClick={() => handleOrderClick(order)}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Order #{order._id}
          </button>
        ))}
      </div>

      {/* Order Details Section */}
      {selectedOrder && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> {selectedOrder._id}</p>
          <p><strong>Customer:</strong> {selectedOrder.customer}</p>
          <p><strong>Total:</strong> ${selectedOrder.total}</p>
          <p><strong>Status:</strong> {selectedOrder.status}</p>
          <h3>Products:</h3>
          <ul>
            {selectedOrder.products.map((product) => (
              <li key={product._id}>
                <strong>{product.name}</strong> - Quantity: {product.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Order;
