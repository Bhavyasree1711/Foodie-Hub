import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFood from './pages/admin/ManageFood';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCategories from './pages/admin/ManageCategories';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDelivery from './pages/admin/ManageDelivery';
import Reports from './pages/admin/Reports';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isStaff } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (!isStaff) return <Navigate to="/" replace />;
  return children;
};

const MainLayout = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdminPage && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      <main className={isAdminPage ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="food" element={<ManageFood />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="delivery" element={<ManageDelivery />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      document.body.classList.toggle('dark-mode', !prev);
      return !prev;
    });
  };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
            <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontWeight: '500' } }} />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
