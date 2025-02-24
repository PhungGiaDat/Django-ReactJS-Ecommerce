import React from "react";
import Placeholder from "./Placeholder";

const PlaceholderContainer = () => {
    const placeNumbers = [...Array(8).keys()].slice(0);
    return (
        <section className="py-5" id="shop">
         <h4 style={{textAlign : "center"}}>Sản phẩm</h4>     
            <div className="container px-4 px-lg-5 mt-5">
                <div className="row justify-content-center">
                    {placeNumbers.map((number) => (
                        <Placeholder key={number} />
                    ))}
                </div>
            </div>  
        </section>
    )
}