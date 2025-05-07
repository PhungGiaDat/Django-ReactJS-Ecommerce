import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import privateAPI from '../../../api/SecureAPI';

function POSView() {
  // State for products and cart
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  // State for customer info
  const [customerInfo, setCustomerInfo] = useState({
    full_name: '',
    phone_number: '',
    email: '',
  });
  
  // State for payment
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    amount_paid: 0,
    discount_applied: 0,
    payment_method: 'CASH',
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price_sold * item.quantity), 0);
  const discount = (subtotal * paymentInfo.discount_applied) / 100;
  const total = subtotal - discount;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await privateAPI.get('/api/products/public');
      const productsWithStock = await Promise.all(
        response.data.map(async (product) => {
          try {
            const stockResponse = await privateAPI.get(`/api/inventory/stocks/${product.id}/`);
            return {
              ...product,
              quantity: stockResponse.data.quantity,
            };
          } catch (error) {
            return { ...product, quantity: 0 };
          }
        })
      );
      setProducts(productsWithStock);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await privateAPI.get('/api/products/categories/public');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, price_sold: product.selling_price }];
    });
  };

  const handleUpdateQuantity = (productId, change) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handlePayment = async () => {
    try {
      // Create order
      const orderData = {
        order_type: 'OFFLINE',
        customer: customerInfo.phone_number ? {
          full_name: customerInfo.full_name,
          phone_number: customerInfo.phone_number,
          email: customerInfo.email,
        } : null,
        items: cart.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price_sold: item.price_sold,
          discount: 0, // Can be modified to add item-level discounts
        })),
      };

      const orderResponse = await privateAPI.post('/api/orders/', orderData);

      // Create invoice
      const invoiceData = {
        order: orderResponse.data.order_id,
        amount_paid: paymentInfo.amount_paid,
        discount_applied: paymentInfo.discount_applied,
        payment_method: paymentInfo.payment_method,
      };

      await privateAPI.post('/api/payment/invoices/', invoiceData);

      // Clear cart and reset
      setCart([]);
      setCustomerInfo({
        full_name: '',
        phone_number: '',
        email: '',
      });
      setPaymentInfo({
        amount_paid: 0,
        discount_applied: 0,
        payment_method: 'CASH',
      });
      setPaymentDialogOpen(false);

      // Show success message or print receipt
      alert('Payment successful!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categories?.ID === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🏪 Point of Sale
      </Typography>

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left side - Product Selection */}
        <Grid item xs={8}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.ID} value={category.ID}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Grid container spacing={2}>
                {filteredProducts.map((product) => (
                  <Grid item xs={4} key={product.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        opacity: product.quantity <= 0 ? 0.5 : 1,
                      }}
                      onClick={() => handleAddToCart(product)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.image || '/placeholder-image.png'}
                        alt={product.name}
                      />
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.selling_price)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stock: {product.quantity}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Cart */}
        <Grid item xs={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Order
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerInfo.full_name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, full_name: e.target.value }))}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={customerInfo.phone_number}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone_number: e.target.value }))}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              />
            </Box>

            <List sx={{ flex: 1, overflow: 'auto' }}>
              {cart.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} x ${new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(item.price_sold)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography component="span" sx={{ mx: 1 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        edge="end"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                Subtotal: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(subtotal)}
              </Typography>
              <Typography variant="subtitle1">
                Discount: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(discount)}
              </Typography>
              <Typography variant="h6">
                Total: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(total)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ReceiptIcon />}
              onClick={() => setPaymentDialogOpen(true)}
              disabled={cart.length === 0}
              sx={{ mt: 2 }}
            >
              Process Payment
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Amount Paid"
            type="number"
            value={paymentInfo.amount_paid}
            onChange={(e) => setPaymentInfo(prev => ({ ...prev, amount_paid: parseFloat(e.target.value) }))}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Discount (%)"
            type="number"
            value={paymentInfo.discount_applied}
            onChange={(e) => setPaymentInfo(prev => ({ ...prev, discount_applied: parseFloat(e.target.value) }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentInfo.payment_method}
              onChange={(e) => setPaymentInfo(prev => ({ ...prev, payment_method: e.target.value }))}
              label="Payment Method"
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CREDIT CARD">Credit Card</MenuItem>
              <MenuItem value="BANK TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="E WALLET">E-Wallet</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePayment}
            variant="contained"
            disabled={paymentInfo.amount_paid < total}
          >
            Complete Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default POSView; 