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
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categoryData, setCategoryData] = useState({
    name: "",
    
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.get("/api/products/categories/public");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
    setLoading(false);
  };

  const openDialog = (category = null) => {
    setModalOpen(true);
    if (category) {
      setEditMode(true);
      setSelectedCategory(category);
      setCategoryData({
        name: category.name || "",
        
      });
    } else {
      setEditMode(false);
      setSelectedCategory(null);
      setCategoryData({ name: ""});
    }
  };

  const closeDialog = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Thêm dấu / vào cuối endpoint API vì django sẽ tự redirect khi endpoint không có dấu / và mất dữ liệu
      if (!editMode) {
        await privateAPI.post("/api/products/categories/", categoryData);
        alert("Thêm danh mục thành công!");
      } else {
        await privateAPI.put(`/api/categories/${selectedCategory.id}`, categoryData);
        alert("Cập nhật danh mục thành công!");
      }
      fetchCategories();
      closeDialog();
    } catch (error) {
      alert("Có lỗi xảy ra!");
      console.error("Error updating category", error);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await privateAPI.delete(`/api/categories/${categoryId}`);
        alert("Xóa danh mục thành công!");
        fetchCategories();
      } catch (error) {
        alert("Xóa danh mục thất bại!");
        console.error("Error deleting category", error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📂 Quản lý danh mục
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => openDialog()}
        sx={{ mb: 2 }}
      >
        Thêm danh mục
      </Button>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card sx={{ transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
                <CardContent>
                  <Typography variant="h6">{category.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton color="primary" onClick={() => openDialog(category)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(category.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Thêm / Sửa danh mục */}
      <Dialog open={modalOpen} onClose={closeDialog}>
        <DialogTitle>{editMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Tên danh mục" name="name" value={categoryData.name} onChange={handleInputChange} required />
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

export default CategoriesManagement;
