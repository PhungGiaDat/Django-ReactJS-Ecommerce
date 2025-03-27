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
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    category: "",
    quantity: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await publicAPI.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.get("/api/public/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
    setLoading(false);
  };

  // Mở dialog
  const openDialog = (product = null) => {
    setModalOpen(true);
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setNewProduct({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        image: null, // Không tự động load ảnh cũ vào input file
        category: product.categories?.ID || "",
        quantity: product.quantity || "",
      });
    } else {
      setEditMode(false);
      setSelectedProduct(null);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        image: null,
        category: "",
        quantity: "",
      });
    }
  };

  // Đóng dialog
  const closeDialog = () => {
    setModalOpen(false);
  };

  // Xử lý nhập form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(newProduct).forEach((key) => {
      formData.append(key, newProduct[key]);
    });

    try {
      if (!editMode) {
        await privateAPI.post("/api/products/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Thêm sản phẩm thành công");
      } else {
        await privateAPI.put(`/api/products/${selectedProduct.id}/update`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Cập nhật sản phẩm thành công");
      }
      fetchProducts();
      closeDialog();
    } catch (error) {
      alert("Có lỗi xảy ra!");
      console.error("Error creating/updating product", error);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await privateAPI.delete(`/api/products/${productId}`);
        alert("Xóa sản phẩm thành công");
        fetchProducts();
      } catch (error) {
        alert("Xóa sản phẩm thất bại");
        console.error("Error deleting product", error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🛍️ Quản lý sản phẩm
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => openDialog()}
        sx={{ mb: 2 }}
      >
        Thêm sản phẩm
      </Button>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image || "https://via.placeholder.com/200"}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giá: {product.price}$
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh mục: {product.categories?.name || "N/A"}
                  </Typography>
                  <Typography variant="body2" color={product.quantity > 0 ? "green" : "red"}>
                    Trạng thái: {product.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton color="primary" onClick={() => openDialog(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Thêm / Sửa sản phẩm */}
      <Dialog open={modalOpen} onClose={closeDialog}>
        <DialogTitle>{editMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Tên sản phẩm" name="name" value={newProduct.name} onChange={handleInputChange} required />
            <TextField label="Mô tả" name="description" multiline rows={3} value={newProduct.description} onChange={handleInputChange} />
            <TextField label="Giá" name="price" type="number" value={newProduct.price} onChange={handleInputChange} required />
            <TextField label="Số lượng" name="quantity" type="number" value={newProduct.quantity} onChange={handleInputChange} required />
            <TextField type="file" name="image" onChange={handleFileChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>{editMode ? "Cập nhật" : "Thêm"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductManagement;
