import { useState } from "react";
import api from "../api/SecureAPI";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN,REFRESH_TOKEN } from "../constants";
import "../styles/form.css";

function UserForm ({route, method}) { 
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    // This function is called when the form is submitted    
    const handleSubmit = async (e) =>{
        setLoading(true);
        e.preventDefault();

        try {
            // Make a POST request to the API backend to login or register (gọi đường dẫn url ở backend thông qua API)
            // truyền 2 biến dữ liệu xuống backend
            const res = await api.post(`/api/${route}`, {
                username,
                password
            });
            // If the request is successful, store the access and refresh tokens in local storage
            // Nếu đăng nhập thành công, lưu token vào local storage 
            if (method === "login"){
                localStorage.setItem(ACCESS_TOKEN,res.data.access);
                localStorage.setItem(REFRESH_TOKEN,res.data.refresh);
                // điều hướng vào trang chủ
                navigate("/");
            } else {
                navigate("/login");
            }

            // Nếu trả về trạng thái HTTP 200, lưu token vào local storage và điều hướng vào trang chủ
            if (res.status === 200){
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            }
            else{
                alert("Invalid credentials");
            }
        }
        catch(error)
        {
            alert(error);
        }finally{
            setLoading(false);
        }
    }


    return <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>
        
        
        <input type="text" className="form-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
        />    

        <input type="text" className="form-input" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />

        <button className="form-button" type="submit">
            {name}
        </button>

    </form>    
}

export default UserForm;