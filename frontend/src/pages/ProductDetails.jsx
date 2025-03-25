import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import publicAPI from "../api/publicAPI";
import '../styles/productdetails.css';

function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]); 
  const { id } = useParams();

  // Static policies information
  const staticPolicies = [
    {
      icon: "🎒",
      title: "Ưu đãi tặng kèm",
      description: "Tặng kèm vớ dệt kim và balo chống thấm đựng giày cho mỗi đơn hàng Giày đá bóng."
    },
    {
      icon: "🔄",
      title: "Đổi hàng dễ dàng",
      description: "Hỗ trợ khách hàng đổi size hoặc mẫu trong vòng 7 ngày (sản phẩm chưa qua sử dụng)."
    },
    {
      icon: "🚚",
      title: "Chính sách giao hàng",
      description: "COD & Freeship toàn quốc khi khách hàng thanh toán chuyển khoản trước từ 100k. Không áp dụng cho hàng phụ kiện."
    },
    {
      icon: "💳",
      title: "Thanh toán tiện lợi",
      description: "Chấp nhận các loại hình thanh toán bằng thẻ, tiền mặt, chuyển khoản."
    }
  ];

  // Fetch product data by ID
  useEffect(() => {
    publicAPI.get(`/api/products/${id}/`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then(res => {
        console.log(res.data);
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
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


  const handleSizeChange = (size) => {
    setSelectedSizes(prevSizes =>
      prevSizes.includes(size) ? prevSizes.filter(s => s !== size) : [...prevSizes, size]
    );
  };

  return (
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
          <div className="d-flex flex-wrap mb-3 mt-2 me-3">
            {product.categories === "Giày Bóng Đá" ? (
              product.size_choices && product.size_choices.length > 0 ? (
                product.size_choices.map((size, index) => (
                  <div key={index} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`size-${index}`}
                      value={size}
                      onChange={() => handleSizeChange(size)}
                      checked={selectedSizes.includes(size)}
                    />
                    <label className="form-check-label me-3" htmlFor={`size-${index}`}>
                      {size}
                    </label>
                  </div>
                ))
              ) : (
                <p>No sizes available</p>
              )
            ) : (
              product.clothes_size_choices && product.clothes_size_choices.length > 0 ? (
                product.clothes_size_choices.map((size, index) => (
                  <div key={index} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`clothes-size-${index}`}
                      value={size}
                      onChange={() => handleSizeChange(size)}
                      checked={selectedSizes.includes(size)}
                    />
                    <label className="form-check-label me-3" htmlFor={`clothes-size-${index}`}>
                      {size}
                    </label>
                  </div>
                ))
              ) : (
                <p>No sizes available</p>
              )
            )}
          </div>


          {/* Quantity and Add to Cart */}
          <div className="d-flex align-items-center mb-4">
            <label htmlFor="quantity" className="me-3">Số lượng:</label>
            <input type="number" id="quantity" className="form-control me-3" defaultValue="1" min="1" style={{ width: "80px" }} />
            <button className="btn btn-danger">Thêm vào giỏ</button>
          </div>

          {/* Static Policies Section */}
          <div className="product-policies mt-4">
            <h5>Ưu đãi và Chính sách</h5>
            <ul className="list-unstyled">
              {staticPolicies.map((policy, index) => (
                <li key={index} className="d-flex align-items-start mb-3">
                  <span className="me-2" style={{ fontSize: "1.5rem" }}>{policy.icon}</span>
                  <div>
                    <strong>{policy.title}</strong>
                    <p className="mb-0">{policy.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
