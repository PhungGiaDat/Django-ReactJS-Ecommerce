import axios from "axios";
import { ACCESS_TOKEN } from "../constants";  // Kiểm tra key này

const LoginAPI = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Thêm interceptor để gắn token vào request
LoginAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        console.log("Token from localStorage:", token);  // Debug

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default LoginAPI;
