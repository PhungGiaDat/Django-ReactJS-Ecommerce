import React, { useState } from "react";
import { Container, Typography, TextField, Button, Paper, Grid, Card, CardContent, CardActions } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import "../css/POSPage.css";

const products = [
  { id: 1, name: "Áo Thể Thao", price: 150000 },
  { id: 2, name: "Giày Bóng Đá", price: 800000 },
  { id: 3, name: "Bóng Rổ", price: 500000 },
];

function POSPage() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleAddToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) - discount;

  const handleCheckout = () => {
    alert("Thanh toán thành công!");
    setCart([]);
  };

  return (
    <Container maxWidth="md" className="pos-container">
      <Typography variant="h4" align="center" gutterBottom>
        <ShoppingCartIcon fontSize="large" /> POS - Bán hàng
      </Typography>

      {/* Thanh tìm kiếm sản phẩm */}
      <TextField
        label="Tìm kiếm sản phẩm..."
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Danh sách sản phẩm */}
      <Grid container spacing={2}>
        {products
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((product) => (
            <Grid item xs={6} sm={4} key={product.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography color="textSecondary">{product.price.toLocaleString()} đ</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => handleAddToCart(product)}
                  >
                    Thêm
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Giỏ hàng */}
      <Paper elevation={3} className="cart">
        <Typography variant="h5" gutterBottom>🛒 Giỏ hàng</Typography>
        {cart.length > 0 ? (
          cart.map((item) => (
            <Grid container key={item.id} alignItems="center" spacing={2}>
              <Grid item xs={6}>
                <Typography>{item.name} x {item.quantity}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography>{(item.price * item.quantity).toLocaleString()} đ</Typography>
              </Grid>
              <Grid item xs={2}>
                <Button color="secondary" onClick={() => handleRemoveFromCart(item.id)}>
                  <DeleteIcon />
                </Button>
              </Grid>
            </Grid>
          ))
        ) : (
          <Typography color="textSecondary">Chưa có sản phẩm nào</Typography>
        )}

        {/* Tổng tiền + Thanh toán */}
        <Typography variant="h6" align="right" mt={2}>
          Tổng: {totalAmount.toLocaleString()} đ
        </Typography>
        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          onClick={handleCheckout}
          disabled={cart.length === 0}
        >
          Thanh toán
        </Button>
      </Paper>
    </Container>
  );
}

export default POSPage;
