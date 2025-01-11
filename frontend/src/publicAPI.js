import axios from "axios";

// Khởi tạo một đối tượng axios với baseURL là địa chỉ của API
// baseURL: 'http://localhost:8000/api'
const publicAPI = axios.create({
    baseURL: process.env.REACT_APP_API_URL,     
})

export default publicAPI;