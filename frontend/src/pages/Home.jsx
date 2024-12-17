import React from 'react';
import Navbars from '../components/Navbars';

function Home() {
    return (
        <>
            <Navbars />
            <div>Home</div>

            <div className="container">
                <div className="product">
                    <h1>Product</h1>
                </div>
            </div>
        </>
    );
}

export default Home;
