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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [filteredSizes, setFilteredSizes] = useState([]); // Lọc size theo danh mục
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    categories: "",
    quantity: "",
    sizes: [],
    shoe_type: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await publicAPI.get("/api/products/categories/public");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await publicAPI.get("/api/products/sizes/");
      setSizes(response.data);
    } catch (error) {
      console.error("Error fetching sizes", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.get("/api/products/public");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
    setLoading(false);
  };

  const openDialog = (product = null) => {
    setModalOpen(true);
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setNewProduct({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        image: null,
        categories: product.categories || "",
        quantity: product.quantity || "",
        sizes: product.sizes?.map((size) => size.id) || [],
        shoe_type: product.shoe_type || "",
      });
      handleCategoryChange({ target: { value: product.category || "" } });
    } else {
      setEditMode(false);
      setSelectedProduct(null);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        image: null,
        categories: "",
        quantity: "",
        sizes: [],
        shoe_type: "",
      });
      setFilteredSizes([]); // Ẩn danh sách size ban đầu
    }
  };

  const closeDialog = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSizeChange = (event) => {
    setNewProduct((prev) => ({ ...prev, sizes: event.target.value }));
  };

  const handleCategoryChange = (event) => {
    const categoryId = Number(event.target.value); // Ép kiểu số
    console.log("Chọn danh mục:", categoryId); // Kiểm tra giá trị

    setNewProduct((prev) => ({
        ...prev,
        category: categoryId,
        sizes: [] // Reset sizes khi đổi category
    }));

    if (!categories.length) {
        console.warn("Categories list is empty!");
        return;
    }

    const selectedCategory = categories.find((cat) => cat.ID === categoryId);
    if (!selectedCategory) {
        console.warn(`Category with ID ${categoryId} not found!`);
        return;
    }

    if (!sizes.length) {
        console.warn("Sizes list is empty!");
        return;
    }

    if (selectedCategory.name.toLowerCase().includes("giày bóng đá")) {
        setFilteredSizes(sizes.filter((size) => !isNaN(size.size))); // Lọc size số
    } else {
        setFilteredSizes(sizes.filter((size) => isNaN(size.size))); // Lọc size chữ (S, M, L)
    }

    console.log("Selected category:", selectedCategory);
    console.log("Filtered sizes:", filteredSizes);
};

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(newProduct).forEach((key) => {
      if (Array.isArray(newProduct[key])) {
        newProduct[key].forEach((value) => formData.append(key, value));
      } else {
        formData.append(key, newProduct[key]);
      }
    });

    try {
      await privateAPI.post("/api/products/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Thêm sản phẩm thành công");
      fetchProducts();
      closeDialog();
    } catch (error) {
      alert("Có lỗi xảy ra!");
      console.error("Lỗi khi thêm sản phẩm", error);
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

      <Dialog open={modalOpen} onClose={closeDialog}>
        <DialogTitle>
          {editMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Tên sản phẩm"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Giá"
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Số lượng"
            type="number"
            name="quantity"
            value={newProduct.quantity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Danh mục</InputLabel>
            <Select
              labelId="category-label"
              value={newProduct.category || ""}
              onChange={handleCategoryChange}
            >
              <MenuItem value="" disabled>
                Chọn danh mục
              </MenuItem>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <MenuItem key={category.ID} value={category.ID}>
                    {category.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Không có danh mục nào</MenuItem>
              )}
            </Select>
          </FormControl>

          {filteredSizes.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
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
                alt="Hình ảnh sản phẩm"
              />
            </Card>
          )}

          <Button variant="contained" component="label">
            Chọn ảnh sản phẩm
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductManagement;
