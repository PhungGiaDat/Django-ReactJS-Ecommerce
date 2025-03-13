import { useEffect,useState } from "react";
import axios from "axios";
import Sidebar from "../components/Admin/components/Sidebar";

function Admin(){
    const [Products, setProducts] = useState([]);
    const [Categories, setCategories] = useState([]);
    const [NewProduct,setNewProduct] = useState({
        name:"",
        description:"",
        price:"",
        image:null, // File upload
        category:"", // ID danh mục
    })

    // Fetch danh mục và sản phẩm khi component mount
    useEffect(()=>{
        fetchProducts();
        fetchCategories();
    },[]);

    // Lấy danh sách sản phẩm từ API
    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products",error);
        }
    }

    // Lấy danh sách danh mục từ API 
    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories",error);
        }
    }

    // Xử lý thay đổi ở trong form 
    const HandleInputChange = (e) => {
        const {name,value} = e.target;
        setNewProduct({NewProduct,[name]:value});
    }

    const handleFileChange = (e) => {
        setNewProduct({NewProduct,image:e.target.files[0]});
    }




    return (
        <>
          <Sidebar />
            <h1>Admin Panel</h1>
    
        </>
      );
}

export default Admin;
