import React from "react";
import NeymarImage from "../static/image/neymar-roi-nike-elle-2.jpg";
import Shoes from "../static/image/shoes.jpg";

const Header = () => {
  return (
    <header className="bg-white py-3">
      <div className="container">
        <div className="row align-items-center">
          {/* Cột hình ảnh bên trái */}
          <div className="col-md-6 text-center">
            <img
              src={NeymarImage}
              alt="Neymar holding shoes"
              className="img-fluid"
            />
          </div>

          {/* Cột hình ảnh bên phải */}
          <div className="col-md-6 text-center">
            <img
              src={Shoes}
              alt="Shoes display"
              className="img-fluid"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
