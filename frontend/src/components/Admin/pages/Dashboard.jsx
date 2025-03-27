import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, Button } from "@mui/material";
import axios from "axios";
import "../css/Dashboard.css";


const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    orders: 0,
    revenue: 0,
    products: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // Fetch stats and recent orders from the API
    const fetchData = async () => {
      try {
        const statsResponse = await axios.get("/api/admin/stats");
        const ordersResponse = await axios.get("/api/admin/recent-orders");

        setStats(statsResponse.data);
        setRecentOrders(ordersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
              <Typography variant="h6">Orders</Typography>
              <Typography variant="h4">{stats.orders}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
              <Typography variant="h6">Revenue</Typography>
              <Typography variant="h4">${stats.revenue}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
              <Typography variant="h6">Products</Typography>
              <Typography variant="h4">{stats.products}</Typography>
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <table className="recent-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>${order.amount}</td>
                      <td>{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", marginTop: 2 }}>
              <Button variant="contained" color="primary">
                Manage Users
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ marginLeft: 1 }}
              >
                View Reports
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
  );
};

export default Dashboard;
