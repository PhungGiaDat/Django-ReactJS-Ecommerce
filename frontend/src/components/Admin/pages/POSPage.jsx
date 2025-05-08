import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert as MuiAlert,
  Grid,
} from "@mui/material";
import privateAPI from '../../../api/SecureAPI';

const steps = ["Chọn sản phẩm", "Xem giỏ hàng", "Thanh toán", "Hoàn tất"];

function normalizeVN(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi');
}

function POSPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [orderSummary, setOrderSummary] = useState(null);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState('all');
  const [addSuccessOpen, setAddSuccessOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    customer_type: 'WALK_IN',
    district: '',
    ward: '',
    street: '',
    city: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchSizes();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await privateAPI.get('/api/products/categories/public');
      setCategories(res.data);
      console.log('Categories:', res.data);
    } catch (e) {
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await privateAPI.get("/api/products/public");
      // Fetch stock for each product
      const productsWithStock = await Promise.all(
        res.data.map(async (product) => {
          try {
            const stockRes = await privateAPI.get(`/api/inventory/stocks/${product.id}/`);
            return { ...product, quantity: stockRes.data.quantity };
          } catch {
            return { ...product, quantity: 0 };
          }
        })
      );
      setProducts(productsWithStock);
      if (productsWithStock.length > 0) {
        console.log('First product:', productsWithStock[0]);
      }
    } catch (e) {
      setError("Không thể tải sản phẩm");
    }
    setLoading(false);
  };

  const fetchSizes = async () => {
    try {
      const res = await privateAPI.get('/api/products/sizes/');
      setSizes(res.data);
    } catch (e) {
      setSizes([]);
    }
  };

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) return;
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id && item.quantity < product.quantity
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setAddSuccessOpen(true);
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.quantity_in_stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.selling_price ?? item.price ?? 0) * item.quantity, 0);

  // Stepper logic
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Payment
  const handlePayment = async () => {
    setLoading(true);
    setError("");
    setPaymentError("");
    try {
      // 1. Create or get customer
      let customerRes;
      try {
        customerRes = await privateAPI.post("/api/customers/", {
          full_name: customerInfo.full_name,
          phone_number: customerInfo.phone_number,
          email: customerInfo.email || null,
          customer_type: customerInfo.customer_type,
        });
      } catch (e) {
        // If customer already exists, try to get by phone number
        const existingCustomer = await privateAPI.get(`/api/customers/search/?phone=${customerInfo.phone_number}`);
        if (existingCustomer.data.length > 0) {
          customerRes = { data: existingCustomer.data[0] };
        } else {
          throw e;
        }
      }

      // 2. Create address if provided
      if (customerInfo.street && customerInfo.district && customerInfo.ward && customerInfo.city) {
        await privateAPI.post("/api/customers/address/", {
          customer: customerRes.data.id,
          street: customerInfo.street,
          district: customerInfo.district,
          ward: customerInfo.ward,
          city: customerInfo.city,
        });
      }

      // 3. Create order
      const orderRes = await privateAPI.post("/api/orders/", {
        order_type: "OFFLINE",
        customer: customerRes.data.id,
        items: cart.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price_sold: Number(item.selling_price ?? item.price ?? 0),
        })),
      });

      // 4. Create invoice
      await privateAPI.post("/api/payment/invoices/", {
        order: orderRes.data.order_id,
        amount_paid: amountPaid,
        payment_method: paymentMethod,
      });

      setOrderSummary({
        order: orderRes.data,
        cart,
        total: subtotal,
        paid: amountPaid,
        customer: customerRes.data,
      });
      setCart([]);
      setStep(3);
      setPaymentSuccessOpen(true);
      setAmountPaid(0);
      setPaymentMethod('CASH');
      setCustomerInfo({
        full_name: '',
        phone_number: '',
        email: '',
        customer_type: 'WALK_IN',
        district: '',
        ward: '',
        street: '',
        city: ''
      });
    } catch (e) {
      setError("Thanh toán thất bại. Vui lòng thử lại.");
      setPaymentError("Thanh toán thất bại. Vui lòng thử lại.");
    }
    setLoading(false);
    setPaymentDialog(false);
  };

  // Find the selected category object
  const selectedCategoryObj = categories.find(cat => String(cat.ID || cat.id) === String(selectedCategory));
  const isFootballCategory = selectedCategoryObj && selectedCategoryObj.name && selectedCategoryObj.name.toLowerCase().includes('giày bóng đá');

  // Filter products by selected category and size, with debug logs and try/catch
  const filteredProducts = products.filter((product) => {
    if (!selectedCategory || selectedCategory === 'all') return true;
    let productCategoryId = null;
    if (Array.isArray(product.categories)) {
      productCategoryId = product.categories[0]; // If array of IDs
    } else if (typeof product.categories === 'number' || typeof product.categories === 'string') {
      productCategoryId = product.categories;
    } else if (product.category) {
      productCategoryId = product.category;
    }
    return String(productCategoryId) === String(selectedCategory);
  });

  // Limit to 10 products for display
  const limitedProducts = filteredProducts.slice(0, 10);

  // When changing category, reset size selection and log
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSize('all');
    console.log('Selected category changed to:', e.target.value);
  };

  const handleAddSuccessClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setAddSuccessOpen(false);
  };

  // Add customer search function
  const handleCustomerSearch = async () => {
    if (!searchPhone) return;
    setSearchingCustomer(true);
    try {
      const response = await privateAPI.get(`/api/customers/search/?phone=${searchPhone}`);
      if (response.data.length > 0) {
        const customer = response.data[0];
        setFoundCustomer(customer);
        setCustomerInfo({
          full_name: customer.full_name,
          phone_number: customer.phone_number,
          email: customer.email || '',
          customer_type: customer.customer_type,
          district: '',
          ward: '',
          street: '',
          city: ''
        });
        // If customer has address, load it
        if (customer.address) {
          setCustomerInfo(prev => ({
            ...prev,
            district: customer.address.district || '',
            ward: customer.address.ward || '',
            street: customer.address.street || '',
            city: customer.address.city || ''
          }));
        }
      } else {
        setFoundCustomer(null);
        setShowCustomerForm(true);
        setCustomerInfo(prev => ({
          ...prev,
          phone_number: searchPhone
        }));
      }
    } catch (error) {
      setError("Lỗi khi tìm kiếm khách hàng");
    }
    setSearchingCustomer(false);
  };

  // Add function to handle new customer
  const handleNewCustomer = () => {
    setFoundCustomer(null);
    setShowCustomerForm(true);
    setCustomerInfo({
      full_name: '',
      phone_number: searchPhone,
      email: '',
      customer_type: 'WALK_IN',
      district: '',
      ward: '',
      street: '',
      city: ''
    });
  };

  // UI
  return (
    <Box sx={{ maxWidth: 1100, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>POS - Bán hàng</Typography>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Typography color="error">{error}</Typography>}
      {step === 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={selectedCategory}
                label="Danh mục"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.ID || cat.id} value={cat.ID || cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {isFootballCategory && (
              <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel>Size</InputLabel>
                  <Select
                    value={selectedSize}
                    label="Size"
                    onChange={e => setSelectedSize(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    {sizes
                      .filter(sz => {
                        // Only show sizes for this category
                        return sz.product_type && sz.product_type.toLowerCase().includes('giày bóng đá');
                      })
                      .map(sz => (
                        <MenuItem key={sz.id} value={sz.id}>{sz.size}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            <TextField
              label="Tìm kiếm sản phẩm..."
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Giá bán</TableCell>
                  <TableCell>Tồn kho</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {limitedProducts
                  .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                  .map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{Number(product.selling_price ?? product.price ?? 0).toLocaleString()} đ</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={product.quantity <= 0}
                          onClick={() => handleAddToCart(product)}
                        >
                          Thêm
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              disabled={cart.length === 0}
              onClick={nextStep}
            >
              Xem giỏ hàng
            </Button>
          </Box>
        </Box>
      )}
      {step === 1 && (
        <Box>
          <Typography variant="h6">Giỏ hàng</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Giá bán</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Thành tiền</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{Number(item.selling_price ?? item.price ?? 0).toLocaleString()} đ</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{(Number(item.selling_price ?? item.price ?? 0) * item.quantity).toLocaleString()} đ</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleRemoveFromCart(item.id)} color="error">Xóa</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={prevStep}>Quay lại</Button>
            <Box>
              <Typography variant="h6">Tổng: {subtotal.toLocaleString()} đ</Typography>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setPaymentDialog(true);
                  setStep(2);
                }}
                disabled={cart.length === 0}
              >
                Thanh toán
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {step === 2 && (
        <Dialog 
          open={paymentDialog} 
          onClose={() => setPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
            <Typography variant="h6">Thanh toán đơn hàng</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                Tổng tiền: {subtotal.toLocaleString('en-US')} đ
              </Typography>
            </Box>

            {/* Customer Search Section */}
            {!foundCustomer && !showCustomerForm && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Tìm kiếm khách hàng
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Số điện thoại"
                    fullWidth
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    disabled={searchingCustomer}
                  />
                  <Button
                    variant="contained"
                    onClick={handleCustomerSearch}
                    disabled={!searchPhone || searchingCustomer}
                  >
                    {searchingCustomer ? 'Đang tìm...' : 'Tìm kiếm'}
                  </Button>
                </Box>
                <Button
                  variant="text"
                  onClick={handleNewCustomer}
                  sx={{ mt: 1 }}
                >
                  + Thêm khách hàng mới
                </Button>
              </Box>
            )}

            {/* Customer Information Section */}
            {(foundCustomer || showCustomerForm) && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Thông tin khách hàng
                  </Typography>
                  {foundCustomer && (
                    <Button
                      variant="text"
                      onClick={handleNewCustomer}
                      size="small"
                    >
                      Thay đổi
                    </Button>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Họ và tên"
                      fullWidth
                      value={customerInfo.full_name}
                      onChange={(e) => setCustomerInfo({...customerInfo, full_name: e.target.value})}
                      disabled={foundCustomer}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Số điện thoại"
                      fullWidth
                      value={customerInfo.phone_number}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone_number: e.target.value})}
                      disabled={foundCustomer}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      fullWidth
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      disabled={foundCustomer}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Loại khách hàng</InputLabel>
                      <Select
                        value={customerInfo.customer_type}
                        label="Loại khách hàng"
                        onChange={(e) => setCustomerInfo({...customerInfo, customer_type: e.target.value})}
                        disabled={foundCustomer}
                      >
                        <MenuItem value="WALK_IN">Khách vãng lai</MenuItem>
                        <MenuItem value="REGULAR">Khách hàng thường xuyên</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Địa chỉ
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quận/Huyện"
                      fullWidth
                      value={customerInfo.district}
                      onChange={(e) => setCustomerInfo({...customerInfo, district: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phường/Xã"
                      fullWidth
                      value={customerInfo.ward}
                      onChange={(e) => setCustomerInfo({...customerInfo, ward: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Đường"
                      fullWidth
                      value={customerInfo.street}
                      onChange={(e) => setCustomerInfo({...customerInfo, street: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Thành phố"
                      fullWidth
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Số tiền khách trả"
                type="number"
                fullWidth
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>đ</Typography>,
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Phương thức thanh toán"
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="CASH">Tiền mặt</MenuItem>
                  <MenuItem value="CARD">Thẻ</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
                  <MenuItem value="E_WALLET">E-wallet</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {amountPaid > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Tiền thối: {(amountPaid - subtotal).toLocaleString('en-US')} đ
                </Typography>
              </Box>
            )}

            {paymentError && (
              <MuiAlert severity="error" sx={{ mt: 2 }}>{paymentError}</MuiAlert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={() => {
                setPaymentDialog(false);
                setFoundCustomer(null);
                setShowCustomerForm(false);
                setSearchPhone('');
                setCustomerInfo({
                  full_name: '',
                  phone_number: '',
                  email: '',
                  customer_type: 'WALK_IN',
                  district: '',
                  ward: '',
                  street: '',
                  city: ''
                });
              }}
              variant="outlined"
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handlePayment}
              disabled={amountPaid < subtotal || !paymentMethod || loading || !customerInfo.full_name || !customerInfo.phone_number}
              startIcon={loading ? <span className="MuiCircularProgress-root MuiCircularProgress-indeterminate" style={{ width: 20, height: 20, marginRight: 8 }} /> : null}
              sx={{ minWidth: 150 }}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {step === 3 && orderSummary && (
        <Box>
          <Typography variant="h5" color="success.main">Thanh toán thành công!</Typography>
          <Typography>Mã đơn hàng: {orderSummary.order.order_id}</Typography>
          <Typography>Tổng tiền: {Number(orderSummary.total ?? 0).toLocaleString('en-US')} đ</Typography>
          <Typography>Khách trả: {Number(orderSummary.paid ?? 0).toLocaleString('en-US')} đ</Typography>
          <Typography>Tiền thừa: {Number((orderSummary.paid ?? 0) - (orderSummary.total ?? 0)).toLocaleString('en-US')} đ</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Đơn giá</TableCell>
                  <TableCell>Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderSummary.cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{Number(item.selling_price ?? item.price ?? 0).toLocaleString('en-US')} đ</TableCell>
                    <TableCell>{(Number(item.selling_price ?? item.price ?? 0) * item.quantity).toLocaleString('en-US')} đ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => { setStep(0); setOrderSummary(null); }}>Bán hàng mới</Button>
          </Box>
        </Box>
      )}
      <Snackbar
        open={addSuccessOpen}
        autoHideDuration={1500}
        onClose={handleAddSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleAddSuccessClose} severity="success" sx={{ width: '100%' }}>
          Đã thêm thành công
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={paymentSuccessOpen}
        autoHideDuration={2000}
        onClose={() => setPaymentSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setPaymentSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Thanh toán thành công!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default POSPage;
