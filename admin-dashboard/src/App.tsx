import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'; 
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests'; 
import UsersPage from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders'; 
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login'; // Assuming you have a LoginPage
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Assuming you created this file

function App() {
 return (
   <Router>
    <AuthProvider>
     <Toaster position="top-center" />
     <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="//requests" element={<Requests />} />
       <Route path="/users" element={<UsersPage />} />
       <Route path="/products" element={<Products />} />
       <Route path="/orders" element={<Orders />} />
      </Route>
     </Routes>
    </AuthProvider>
   </Router>
 );
}

export default App;
