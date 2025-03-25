import {React,useEffect,useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faShoppingCart } from "@fortawesome/free-solid-svg-icons"; 
import api from '../api/publicAPI';

function Navbars(){
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get("/api/products/categories/public")
            .then(res => {
                console.log(res.data);
                setCategories(res.data);
            })
            .catch(err => {
                console.log(err.message);
            });
    } , []);


    // lọc dữ liệu từ API 

    const UniqueCategories = categories.filter((category, index, self) => index === self.findIndex(cate => cate.ID === category.ID));


    return (
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Sports</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="#">TRANG CHỦ</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">GIỚI THIỆU</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                SẢN PHẨM
                            </a>
                            <ul className="dropdown-menu">
                                {UniqueCategories.map((category) => (
                                    <li key={category.ID}>
                                        <a className="dropdown-item" href="#">
                                        {category.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <i class="fa fa-xing" aria-hidden="true"></i>

                        <li className="nav-item">
                            <a href="" className="nav-link">GIỎ HÀNG</a>
                        </li>
                        <li className="nav-item">
                            <a href="" className="nav-link">LIÊN HỆ</a>
                        </li>
                     </ul>
                    

                    <ul class="navbar-nav"> 
                        <form class="d-flex" role="search">
                            <li class="nav-item"><a href="" class="nav-link"><FontAwesomeIcon icon={faMagnifyingGlass}/></a></li>
                            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
                            <button class="btn btn-outline-success" type="submit">Search</button>
                        </form>
                        <li>
                            <a class="nav-link" href="#">Đăng Nhập</a>
                        </li>   
                        <li>
                            <a class="nav-link" href="#">Đăng Ký    </a>
                        </li>
                        <li>
                            <a class="nav-link" href="#">
                                <FontAwesomeIcon icon={faShoppingCart} />
                            </a>
                        </li>

                    </ul>

                </div>  
            </div>
      </nav>
    )
}

export default Navbars;