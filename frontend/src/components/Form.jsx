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
  const title = isLogin ? "Login" : "Register";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post(`/api/${route}`, { username, password });

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }

      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
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
                  Don't have an account? Sign up
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
