import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaFacebook, FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => (
  <footer className="footer-section bg-dark text-white mt-auto pt-5 pb-3">
    <div className="container">
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUtensils className="text-danger" size={24} />
            <span className="fw-bold fs-4">FoodieHub</span>
          </div>
          <p className="text-muted small">Delicious food delivered to your doorstep. Fresh ingredients, authentic recipes, unforgettable taste.</p>
          <div className="d-flex gap-3 mt-3">
            <a href="#" className="text-muted"><FaFacebook size={20} /></a>
            <a href="#" className="text-muted"><FaInstagram size={20} /></a>
            <a href="#" className="text-muted"><FaTwitter size={20} /></a>
          </div>
        </div>
        <div className="col-lg-2 col-md-6">
          <h6 className="fw-bold mb-3 text-white">Quick Links</h6>
          <ul className="list-unstyled small">
            <li className="mb-2"><Link to="/" className="text-muted text-decoration-none footer-link">Home</Link></li>
            <li className="mb-2"><Link to="/menu" className="text-muted text-decoration-none footer-link">Menu</Link></li>
            <li className="mb-2"><Link to="/orders" className="text-muted text-decoration-none footer-link">Orders</Link></li>
          </ul>
        </div>
        <div className="col-lg-3 col-md-6">
          <h6 className="fw-bold mb-3 text-white">Categories</h6>
          <ul className="list-unstyled small">
            {['Starters', 'Main Course', 'Desserts', 'Drinks', 'Pizza', 'Burgers'].map((cat) => (
              <li key={cat} className="mb-1">
                <Link to={`/menu?category=${cat}`} className="text-muted text-decoration-none footer-link">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-lg-3 col-md-6">
          <h6 className="fw-bold mb-3 text-white">Contact Us</h6>
          <ul className="list-unstyled small">
            <li className="mb-2 text-muted d-flex align-items-center gap-2"><FaPhone size={14} /> +1 (555) 123-4567</li>
            <li className="mb-2 text-muted d-flex align-items-center gap-2"><FaEnvelope size={14} /> hello@foodiehub.com</li>
            <li className="mb-2 text-muted d-flex align-items-center gap-2"><FaMapMarkerAlt size={14} /> 123 Food Street, NY 10001</li>
          </ul>
        </div>
      </div>
      <hr className="border-secondary mt-4" />
      <div className="text-center text-muted small">
        <p className="mb-0">© 2026 FoodieHub. All rights reserved. | Made with ❤️ for food lovers</p>
      </div>
    </div>
  </footer>
);

export default Footer;
