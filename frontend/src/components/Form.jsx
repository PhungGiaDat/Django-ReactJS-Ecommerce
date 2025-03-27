import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/SecureAPI";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

// Import Material UI
import { TextField, Button, Typography, Card, CardContent, CircularProgress, Box, Stack } from "@mui/material";

function UserForm({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = method === "login"; // Kiểm tra form là Login hay Register
  const title = isLogin ? "Đăng Nhập" : "Đăng Ký";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post(`/api/${route}`, { username, password });

      if (isLogin && res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem("is_admin",res.data.is_admin);
        navigate("/");
        // Kiểm tra xem người dùng có phải là admin không
        // Nếu có thì chuyển hướng đến trang admin
        if (res.data.is_admin) {
          navigate("/admin");
        }

      } else {
        navigate("/login");
      }

    } catch (error) {
        alert("Đang nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản.");
        console.error("Error during login:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Card sx={{ width: 400, padding: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {title}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : title}
              </Button>

              {/* Nút chuyển sang trang Register nếu đang ở Login */}
              {isLogin && (
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate("/register")}
                >
                  Chưa có tài khoản? Đăng ký  
                </Button>
              )}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserForm;
