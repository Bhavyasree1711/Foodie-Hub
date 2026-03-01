import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUserCircle, FaBars, FaMoon, FaSun, FaUtensils } from 'react-icons/fa';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar navbar-expand-lg sticky-top ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light'}`} style={{ background: darkMode ? '#1a1a2e' : 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', boxShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <FaUtensils className="text-white" size={24} />
          <span className="fw-bold text-white fs-4">FoodieHub</span>
        </Link>
        <button className="navbar-toggler border-0" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars className="text-white" />
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link text-white fw-medium" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link text-white fw-medium" to="/menu">Menu</Link></li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-white p-0 border-0" onClick={toggleDarkMode}>
              {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            {isAuthenticated && (
              <Link to="/cart" className="position-relative text-white">
                <FaShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ? (
              <div className="dropdown">
                <button className="btn btn-link text-white dropdown-toggle p-0 border-0 d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                  <FaUserCircle size={22} />
                  <span className="fw-medium d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  {isAdmin && <li><Link className="dropdown-item" to="/admin">Admin Dashboard</Link></li>}
                  <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm fw-medium">Login</Link>
                <Link to="/register" className="btn btn-light btn-sm fw-medium text-danger">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
