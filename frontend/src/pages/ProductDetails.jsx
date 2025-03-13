import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import publicAPI from "../publicAPI";
import '../styles/products.css';
import Navbars from "../components/Navbars";

function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // Fetch product data by ID
  useEffect(() => {
    publicAPI.get(`/api/products/public/${id}`)
      .then(res => {
        console.log("API response:", res.data);  // Debug API response
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(product.price);

  return (
    <>
    <Navbars />
      <div className="container my-5">
        <div className="row">
          {/* Product Images */}
          <div className="col-md-6">
            <div className="product-images">
              <img id="main-image" src={product.image} className="img-fluid" alt={product.name} />
            </div>
          </div>

          {/* Product Details */}
          <div className="col-md-6">
            <h2 className="product-title">{product.name}</h2>
            <p className="product-type">Loại: {product.type}</p>
            <p className="product-price">
              <span className="text-danger fs-4 fw-bold">{formattedPrice}</span>
            </p>

            {/* Size Options */}
            <h5>Kích thước</h5>
            <div className="d-flex flex-wrap mb-3">
              {product.sizes.map((size, index) => (
                <button key={index} className="btn btn-outline-secondary m-1">{size}</button>
              ))}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="d-flex align-items-center mb-4">
              <label htmlFor="quantity" className="me-3">Số lượng:</label>
              <input type="number" id="quantity" className="form-control me-3" defaultValue="1" min="1" style={{ width: "80px" }} />
              <button className="btn btn-danger">Thêm vào giỏ</button>
            </div>


          </div>
        </div>
      </div>
    </>
    
    
  );
}

export default ProductDetails;
