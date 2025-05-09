import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SecureAPI from "../api/SecureAPI";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({children}) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        checkToken().catch(() => setIsAuthenticated(false));
    },[]);

    const refreshToken = async () => {
        const refresh_token = localStorage.getItem(REFRESH_TOKEN);
        if (!refresh_token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const res = await SecureAPI.post("/api/token/refresh/", {
                refresh: refresh_token
            });
            
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setIsAuthenticated(false);
        }
    }

    const checkToken = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiry = decoded.exp;
            const currentTime = Date.now() / 1000;

            if (tokenExpiry < currentTime) {
                await refreshToken();
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Token validation failed:", error);
            setIsAuthenticated(false);
        }
    }

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;