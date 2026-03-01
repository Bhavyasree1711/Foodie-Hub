import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getFoodItems } from '../services/api';
import FoodCard from '../components/FoodCard';
import Loader from '../components/Loader';
import { FaArrowRight, FaStar, FaClock, FaTruck, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, foodRes] = await Promise.all([getCategories(), getFoodItems()]);
        setCategories(catRes.data);
        setFeatured(foodRes.data.slice(0, 8));
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const categoryIcons = { Starters: '🥗', 'Main Course': '🍛', Desserts: '🍮', Drinks: '🥤', Pizza: '🍕', Burgers: '🍔' };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="row align-items-center min-vh-75 py-5">
            <div className="col-lg-6">
              <div className="hero-badge mb-3">
                <span className="badge bg-danger rounded-pill px-3 py-2">🔥 Free delivery on orders above ₹299</span>
              </div>
              <h1 className="hero-title display-4 fw-bold text-white mb-4">
                Delicious Food<br /><span className="text-warning">Delivered Fast</span><br />To Your Door
              </h1>
              <p className="text-white-50 fs-5 mb-4">
                Order from our extensive menu of authentic dishes crafted with fresh ingredients and love.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/menu" className="btn btn-danger btn-lg rounded-pill px-4 fw-bold">
                  Order Now <FaArrowRight className="ms-2" />
                </Link>
                <Link to="/menu" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-bold">
                  View Menu
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
              <div className="hero-image-wrapper">
                <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format" alt="Food" className="hero-food-img rounded-circle" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section py-4 bg-white shadow-sm">
        <div className="container">
          <div className="row g-4 text-center">
            {[{ icon: <FaStar className="text-warning" />, val: '4.8+', label: 'Rating' }, { icon: <FaTruck className="text-danger" />, val: '30 min', label: 'Avg Delivery' }, { icon: <FaClock className="text-primary" />, val: '24/7', label: 'Open Hours' }, { icon: <FaShieldAlt className="text-success" />, val: '100%', label: 'Fresh Food' }].map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="stat-item">
                  <div className="stat-icon mb-2">{s.icon}</div>
                  <h4 className="fw-bold mb-0">{s.val}</h4>
                  <small className="text-muted">{s.label}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 mb-2 fw-semibold">EXPLORE</span>
            <h2 className="fw-bold display-6">Browse Categories</h2>
            <p className="text-muted">Find exactly what you're craving</p>
          </div>
          {loading ? <Loader /> : (
            <div className="row g-3">
              {categories.map((cat) => (
                <div key={cat.id} className="col-6 col-md-4 col-lg-2">
                  <Link to={`/menu?category=${cat.id}`} className="text-decoration-none">
                    <div className="category-card card border-0 text-center p-3 rounded-4 h-100">
                      <div className="category-icon mb-2" style={{ fontSize: '2.5rem' }}>
                        {categoryIcons[cat.name] || '🍽️'}
                      </div>
                      <p className="fw-semibold mb-0 small">{cat.name}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Items */}
      <section className="featured-section py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 mb-2 fw-semibold">POPULAR</span>
              <h2 className="fw-bold display-6 mb-0">Featured Dishes</h2>
            </div>
            <Link to="/menu" className="btn btn-outline-danger rounded-pill px-4 fw-medium">
              See All <FaArrowRight className="ms-1" />
            </Link>
          </div>
          {loading ? <Loader /> : (
            <div className="row g-4">
              {featured.map((item) => (
                <div key={item.id} className="col-6 col-md-4 col-lg-3">
                  <FoodCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-5 text-center" style={{ background: 'linear-gradient(135deg, #ff6b35, #f7931e)' }}>
        <div className="container">
          <h2 className="fw-bold text-white mb-3 display-6">Ready to Order?</h2>
          <p className="text-white-75 mb-4 fs-5">Get your favorite food delivered in minutes!</p>
          <Link to="/menu" className="btn btn-light btn-lg rounded-pill px-5 fw-bold text-danger">
            Order Now <FaArrowRight className="ms-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
