import React, { useEffect, useState } from "react";
import publicAPI from "../../../api/publicAPI";
import privateAPI from "../../../api/SecureAPI";

// Material UI
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  CardMedia,
  OutlinedInput,
  Chip,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSizes, setFilteredSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    purchase_price: "",
    selling_price: "",
    image: null,
    category: "",
    quantity: "",
    sizes: [],
    shoe_type: "",
    supplier: "",
  });

  // Add logout dialog state
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await publicAPI.get("/api/products/categories/public");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
      setError("Failed to fetch categories");
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await publicAPI.get("/api/products/sizes/");
      setSizes(response.data);
    } catch (error) {
      console.error("Error fetching sizes", error);
      setError("Failed to fetch sizes");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.get("/api/products/public");
      // Fetch stock data for each product
      const productsWithStock = await Promise.all(
        response.data.map(async (product) => {
          try {
            const stockResponse = await privateAPI.get(`/api/inventory/stocks/${product.id}/`);
            const stockEntryResponse = await privateAPI.get(`/api/inventory/stock-entries/?product=${product.id}`);
            const latestEntry = stockEntryResponse.data[0]; // Get the latest entry
            
            return {
              ...product,
              quantity: stockResponse.data.quantity,
              purchase_price: latestEntry?.purchase_price || 0,
              selling_price: latestEntry?.selling_price || 0
            };
          } catch (error) {
            console.error(`Error fetching stock data for product ${product.id}:`, error);
            return {
              ...product,
              quantity: 0,
              purchase_price: 0,
              selling_price: 0
            };
          }
        })
      );
      setProducts(productsWithStock);
    } catch (error) {
      console.error("Error fetching products", error);
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  const fetchSuppliers = async () => {
    try {
      const response = await publicAPI.get("/api/suppliers/");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers", error);
      setError("Failed to fetch suppliers");
    }
  };

  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await privateAPI.delete(`/api/products/${productToDelete}/`);
      await fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product");
    }
  };

  const openDialog = (product = null) => {
    setError("");
    setModalOpen(true);
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setNewProduct({
        name: product.name || "",
        description: product.description || "",
        purchase_price: product.purchase_price || "",
        selling_price: product.selling_price || "",
        image: null,
        category: product.categories?.ID || "",
        quantity: product.quantity || "",
        sizes: product.sizes?.map((size) => size.id) || [],
        shoe_type: product.shoe_type || "",
        supplier: product.supplier?.id || "",
      });
      handleCategoryChange({ target: { value: product.categories?.ID || "" } });
    } else {
      setEditMode(false);
      setSelectedProduct(null);
      setNewProduct({
        name: "",
        description: "",
        purchase_price: "",
        selling_price: "",
        image: null,
        category: "",
        quantity: "",
        sizes: [],
        shoe_type: "",
        supplier: "",
      });
      setFilteredSizes([]);
    }
  };

  const closeDialog = () => {
    setModalOpen(false);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError("File size too large. Please choose an image under 5MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file.");
        return;
      }
      setNewProduct((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSizeChange = (event) => {
    setNewProduct((prev) => ({ ...prev, sizes: event.target.value }));
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    
    setNewProduct((prev) => ({
      ...prev,
      category: categoryId,
      sizes: []
    }));

    const selectedCategory = categories.find((cat) => cat.ID === categoryId);
    if (selectedCategory) {
      const isFootwear = selectedCategory.name.toLowerCase().includes("giày");
      setFilteredSizes(sizes.filter((size) => 
        isFootwear ? !isNaN(size.size) : isNaN(size.size)
      ));
    }
  };

  const validateForm = () => {
    if (!newProduct.name) return "Product name is required";
    if (!newProduct.purchase_price || newProduct.purchase_price <= 0) return "Valid purchase price is required";
    if (!newProduct.selling_price || newProduct.selling_price <= 0) return "Valid selling price is required";
    if (!newProduct.quantity || newProduct.quantity < 0) return "Valid quantity is required";
    if (!newProduct.category) return "Category is required";
    if (!newProduct.supplier) return "Supplier is required";
    if (!newProduct.sizes.length) return "At least one size must be selected";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("purchase_price", newProduct.purchase_price);
    formData.append("selling_price", newProduct.selling_price);
    formData.append("quantity", newProduct.quantity);
    formData.append("categories", newProduct.category);
    formData.append("supplier", newProduct.supplier);

    newProduct.sizes.forEach(sizeId => {
      formData.append("sizes", sizeId);
    });

    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    try {
      if (editMode) {
        await privateAPI.put(`/api/products/${selectedProduct.id}/`, formData);
      } else {
        await privateAPI.post("/api/products/create", formData);
      }
      await fetchProducts();
      closeDialog();
    } catch (error) {
      console.error("Error saving product:", error.response?.data);
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to save product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    // Clear any stored tokens or user data
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          🛍️ Quản lý sản phẩm
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => openDialog()}
        sx={{ mb: 2 }}
      >
        Thêm sản phẩm
      </Button>

      {/* Product Grid */}
      <Grid container spacing={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image || '/placeholder-image.png'}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description?.substring(0, 100)}...
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(product.selling_price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giá nhập: {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(product.purchase_price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh mục: {product.categories?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Số lượng tồn kho: {product.quantity}
                  </Typography>
                  {product.shoe_type && (
                    <Typography variant="body2" color="text.secondary">
                      Loại giày: {product.shoe_type}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton 
                    onClick={() => openDialog(product)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error"
                    onClick={() => handleDeleteClick(product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>Xác nhận đăng xuất</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleLogoutConfirm}
            color="error"
            variant="contained"
          >
            Đăng xuất
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sản phẩm này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={modalOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Tên sản phẩm"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Giá nhập"
            type="number"
            name="purchase_price"
            value={newProduct.purchase_price}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Giá bán đề xuất"
            type="number"
            name="selling_price"
            value={newProduct.selling_price}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Số lượng"
            type="number"
            name="quantity"
            value={newProduct.quantity}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={newProduct.category}
              name="category"
              onChange={handleCategoryChange}
              label="Danh mục"
            >
              {categories.map((category) => (
                <MenuItem key={category.ID} value={category.ID}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Nhà cung cấp</InputLabel>
            <Select
              value={newProduct.supplier}
              name="supplier"
              onChange={handleInputChange}
              label="Nhà cung cấp"
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {filteredSizes.length > 0 && (
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Sizes</InputLabel>
              <Select
                multiple
                value={newProduct.sizes}
                onChange={handleSizeChange}
                input={<OutlinedInput label="Sizes" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={filteredSizes.find((s) => s.id === value)?.size}
                      />
                    ))}
                  </Box>
                )}
              >
                {filteredSizes.map((size) => (
                  <MenuItem key={size.id} value={size.id}>
                    {size.size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {newProduct.image && (
            <Card sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                height="140"
                image={
                  typeof newProduct.image === "string"
                    ? newProduct.image
                    : URL.createObjectURL(newProduct.image)
                }
                alt="Product preview"
              />
            </Card>
          )}

          <Button variant="contained" component="label">
            Chọn ảnh sản phẩm
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} />
            ) : editMode ? (
              "Cập nhật"
            ) : (
              "Thêm"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductManagement;
