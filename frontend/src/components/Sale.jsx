import React from "react";
import Banner from "../static/image/banner.jpg";
function Sale(){
    return (
        <section>
            <div className="container">
                <h1 className="text-center">HOT HOT HOT</h1>
                <h1>
                    <img 
                    src={Banner} 
                    alt="Nike" 
                    />
                </h1>
            </div>
        </section>
    )
}

export default Sale;