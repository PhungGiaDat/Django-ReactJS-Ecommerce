import logo from './logo.svg';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute'; 
import Home from './pages/Home';
import RegisterComponents from './pages/Register';
import NotFound from './pages/NotFound';
import React from 'react';


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
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>}
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<RegisterComponents />} />
        <Route path='*' element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
