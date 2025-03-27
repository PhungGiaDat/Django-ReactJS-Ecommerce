import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Giả lập user
  const user = {
    name: "Admin",
    avatar: "", // link ảnh nếu có
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    alert("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <AppBar className="header" position="fixed">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          🏪 Quản lý cửa hàng
        </Typography>

        <Box>
          <IconButton onClick={handleMenuOpen} color="inherit">
            <Avatar src={user?.avatar}>
              {!user?.avatar && <AccountCircleIcon />}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => navigate("/")}>
              <HomeIcon sx={{ mr: 1 }} />
              Trang chủ
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
