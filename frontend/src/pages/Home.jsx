import React from 'react';
import BGgiaydabanhHome from '../styles/images/BGgiaydabanhHome.jpg';
import neymar from '../styles/images/neymar.jpg'
import Navbars from '../components/Navbars';
import '../styles/Home.css';

const Home = () => {
    return (
        <>
            <Navbars />
            <div className="container image-container"> 
                <img src={BGgiaydabanhHome} alt="Background" /> 
                <img src={neymar} alt="Second Background" /> 
            </div>

            <div className="container">
                <div className="product">
                    <h1>Product</h1>
                    <h3>You can find new sport product here</h3>
                </div>
            </div>

            <div className="container">
                <div className="about-us">
                    <h1>About Us</h1>
                    <h3>Learn more about our company</h3>
                </div>

                <div className="contact">
                    <h1>Contact</h1>
                    <h3>Get in touch with us</h3>
                </div>
            </div>

        </>
    );
};

export default Home;
