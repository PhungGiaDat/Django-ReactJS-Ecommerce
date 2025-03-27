import logo from './logo.svg';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute'; 
import Home from './pages/Home';
import RegisterComponents from './pages/Register';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/Admin';
import ProductDetails from './pages/ProductDetails';
import React from 'react';
import AdminProduct from './components/Admin/pages/AdminProduct';
import OrderPage from './components/Admin/pages/Order';
import Dashboard from './components/Admin/pages/Dashboard';
import CategoriesManagement from './components/Admin/pages/CategoriesManagement';
import POSPage from './components/Admin/pages/POSPage';


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

   
          <Route path="/admin" element={
            // <ProtectedRoute>
              <AdminLayout />
            // </ProtectedRoute>
          }>
            <Route path = "dashboard" index element={<Dashboard />} /> {/* `/admin` mặc định vào Dashboard */}
            <Route path="products" element={<AdminProduct />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="pos" element={<POSPage />} />
          </Route>
          
        <Route path="/product/:id" element={<ProductDetails />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
