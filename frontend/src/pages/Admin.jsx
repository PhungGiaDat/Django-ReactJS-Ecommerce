import { useEffect,useState } from "react";
import axios from "axios";

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


    // gửi form về backend
    const HandleSubmit = async (e) => { 
        e.preventDefault();
        // khởi tạo một đối tượng formdata
        const formdata = new FormData();
        formdata.append("name",NewProduct.name);
        formdata.append("description",NewProduct.description);
        formdata.append("price",NewProduct.price);
        formdata.append("categories",NewProduct.category);
        if (NewProduct.image){
            formdata.append("image",NewProduct.image);
        }

        try {
            await axios.post("http://localhost:8000/api/products/create",formdata,{
                headers:{
                    "Content-Type":"multipart/form-data"
                }
            });

            // Sau khi thêm sản phẩm thành công thì fetch lại danh sách sản phẩm
            alert("Thêm sản phẩm thành công");
            setNewProduct({
                        name:"",
                        description:"",
                        price:"",
                        image:null,
                        category:"",
            })
            fetchProducts();// reset lại danh sách sản phẩm

        } catch (error) {
            alert("Thêm sản phẩm thất bại");
            console.error("Error creating product",error);
        }
    }

    return (
        <div>
          <h1>Admin Panel</h1>
    
          {/* Form thêm sản phẩm */}
          <form onSubmit={HandleSubmit}>
            <label>
              Name:
              <input type="text" name="name" value={NewProduct.name} onChange={HandleInputChange} required />
            </label>
            <br />
    
            <label>
              Description:
              <textarea name="description" value={NewProduct.description} onChange={HandleInputChange} required />
            </label>
            <br />
    
            <label>
              Price:
              <input type="number" name="price" value={NewProduct.price} onChange={HandleInputChange} required />
            </label>
            <br />
    
            <label>
              Category:
              <select name="category" value={NewProduct.category} onChange={HandleInputChange} required>
                <option value="">-- Select Category --</option>
                {Categories.map((category) => (
                  <option key={category.ID} value={category.ID}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <br />
    
            <label>
              Image:
              <input type="file" name="image" onChange={handleFileChange} />
            </label>
            <br />
    
            <button type="submit">Add Product</button>
          </form>
    
          {/* Danh sách sản phẩm */}
          <h2>Products List</h2>
          <ul>
            {Products.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong> - {product.price}$
                <br />
                Category: {product.categories.name || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      );
}

export default Admin;
