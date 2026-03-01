import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaConciergeBell, FaTags, FaClipboardList, FaUsers, FaBars, FaTimes, FaUtensils, FaSignOutAlt, FaHome, FaTruck, FaChartBar } from 'react-icons/fa';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: <FaTachometerAlt />, end: true },
    { to: '/admin/food', label: 'Food & Stock', icon: <FaConciergeBell /> },
    { to: '/admin/categories', label: 'Categories', icon: <FaTags /> },
    { to: '/admin/orders', label: 'Orders', icon: <FaClipboardList /> },
    { to: '/admin/delivery', label: 'Deliveries', icon: <FaTruck /> },
    { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { to: '/admin/reports', label: 'Reports', icon: <FaChartBar /> },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
          <div className={`d-flex align-items-center gap-2 ${!sidebarOpen ? 'd-none' : ''}`}>
            <FaUtensils className="text-danger" size={20} />
            {sidebarOpen && <span className="fw-bold text-white">FoodieHub</span>}
          </div>
          <button className="btn btn-link text-white p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <div className="sidebar-user p-3 border-bottom border-secondary">
          <div className={`d-flex align-items-center gap-2 ${!sidebarOpen ? 'justify-content-center' : ''}`}>
            <div className="user-avatar-small">{user?.name?.charAt(0)}</div>
            {sidebarOpen && <div><p className="mb-0 text-white small fw-semibold">{user?.name}</p><p className="mb-0 text-white-50" style={{ fontSize: '0.7rem' }}>Administrator</p></div>}
          </div>
        </div>
        <nav className="sidebar-nav p-2">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) => `sidebar-nav-link d-flex align-items-center gap-3 p-3 rounded-3 mb-1 text-decoration-none ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-content-center' : ''}`}>
              <span>{link.icon}</span>
              {sidebarOpen && <span className="small fw-medium">{link.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer p-3 mt-auto border-top border-secondary">
          <Link to="/" className={`sidebar-nav-link d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none mb-2 ${!sidebarOpen ? 'justify-content-center' : ''}`}>
            <FaHome />{sidebarOpen && <span className="small fw-medium">View Site</span>}
          </Link>
          <button className={`sidebar-nav-link d-flex align-items-center gap-3 p-2 rounded-3 btn btn-link text-start w-100 text-decoration-none ${!sidebarOpen ? 'justify-content-center' : ''}`} onClick={handleLogout}>
            <FaSignOutAlt className="text-danger" />{sidebarOpen && <span className="small fw-medium text-danger">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main flex-grow-1" style={{ overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
