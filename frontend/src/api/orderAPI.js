import React, { useEffect, useState } from "react";
import publicAPI from "../../../api/orderAPI";

function Order() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            const data = await fetchOrders();
            setOrders(data);
        };

        loadOrders();
    }, []);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    return (
        <div>
            <h1>Orders</h1>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
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

            {selectedOrder && (
                <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "5px" }}>
                    <h2>Order Details</h2>
                    <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                    <p><strong>Customer:</strong> {selectedOrder.customer}</p>
                    <p><strong>Total:</strong> {selectedOrder.formattedTotal}</p>
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