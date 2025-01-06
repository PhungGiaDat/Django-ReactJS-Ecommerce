import React from "react";
import axios from "axios";


function Product(){
    const [products, setProducts] = React.useState([]);

    const GetProducts = async () => {
        try {
            res = await axios.get("/api/public/products"),{
                headers: {
                    "Content-Type": "application/json"
                }
            }

        } catch (error) {
            
        }
    }

    return (
        <section>
            <h1 className="text-center">SẢN PHẨM/HOT SALE</h1>
            <div className="container">

            </div>
        </section>
    )
}


export default Product;