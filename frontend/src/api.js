import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Khởi tạo một đối tượng axios với baseURL là địa chỉ của API
// baseURL: 'http://localhost:8000/api'
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,     
})


// Thêm một interceptor vào axios để thêm token vào header của request
// Nếu token tồn tại trong localStorage
// Các request sẽ được gắn thêm header
// Dùng để kiểm tra token khi gửi request
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;    
    },
    error =>{
        return Promise.reject(error);
    }   
)

export default api;