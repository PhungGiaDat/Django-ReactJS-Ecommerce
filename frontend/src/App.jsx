import logo from './logo.svg';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute'; 
import Home from './pages/Home';
import RegisterComponents from './pages/Register';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import ProductDetails from './pages/ProductDetails';
import React from 'react';
import AdminProduct from './components/Admin/pages/AdminProduct';



function Logout(){
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterPage() {
  localStorage.clear();
  return <RegisterComponents />;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
        path='/' 
        element={
          // <ProtectedRoute>
            <Home />
          // </ProtectedRoute>
        }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<RegisterComponents />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/products/:id' element={<ProductDetails />} />
        <Route path='/admin' element={<Admin />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/admin/products" element={<AdminProduct />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
