import React from 'react';
import Navbars from '../components/Navbars';
import Header from '../components/Header';
import Sale from '../components/Sale';
import Introduction from '../components/Introduction';
import Product from '../components/Product';
import Footer from '../components/Footer';
import Clothes from '../components/Clothes';
function Home() {
    return (
        <>
            <Navbars />
            <Header /> 
            <Sale />
            <Introduction />
            <Product />
            <Clothes />
            <Footer />
        </>
    );
}

export default Home;
