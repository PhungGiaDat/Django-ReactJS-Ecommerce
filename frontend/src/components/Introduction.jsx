import React from "react";
import img1 from "../static/image/1.webp";
import img2 from "../static/image/2.jpg";
import img3 from "../static/image/3.webp";
import img4 from "../static/image/4.webp";
import img5 from "../static/image/5.webp";
import img6 from "../static/image/6.webp";

function renderImage(feature) {
  return (
    <picture>
      <img
        src={feature.img}
        alt={feature.title}
        className="rounded-circle img-fluid mx-auto"
        style={{ width: "150px", height: "150px", objectFit: "cover" }}
      />
    </picture>
  );
}


function Introduction() {
  const features = [
    {
      img: img1, // Đường dẫn ảnh 1
      title: "Tư vấn bán hàng chuyên nghiệp",
    },
    {
      img: img2, // Đường dẫn ảnh 2
      title: "Hỗ trợ khách hàng đo chân chính xác",
    },
    {
      img: img3, // Đường dẫn ảnh 3
      title: "Quà tặng khi mua giày (Túi, Vớ, Bình Xịt)",
    },
    {
      img: img4, // Đường dẫn ảnh 4
      title: "Thanh toán linh hoạt (Tiền mặt, Thẻ, Chuyển Khoản)",
    },
    {
      img: img5, // Đường dẫn ảnh 5
      title: "Giao hàng nhanh chóng đến cho khách hàng",
    },
    {
      img: img6, // Đường dẫn ảnh 6
      title: "Chính sách bảo hành/đổi trả",
    },
  ];

  return (
    <section className="py-5">
      <div className="container text-center">
        <h1 className="mb-4">Giới thiệu về cửa hàng</h1>
        <p className="mb-5">
          Cửa hàng của chúng tôi chuyên bán giày với chất lượng hàng đầu. Chúng tôi luôn cam kết mang lại trải nghiệm mua sắm tốt nhất cho khách hàng.
        </p>
        <div className="row">
          {features.map((feature, index) => (
            <div key={index} className="col-md-4 col-sm-6 mb-4">
              <div className="card border-0">
                {renderImage(feature)}
                <div className="card-body">
                  <p className="card-text">{feature.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Introduction;
