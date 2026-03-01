import React from 'react';
import { FaStar, FaLeaf, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Curated fallback images per food name & category
const FOOD_IMAGES = {
  'Veg Spring Rolls':     'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&h=280&fit=crop&auto=format',
  'Chicken Tikka':        'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=280&fit=crop&auto=format',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=280&fit=crop&auto=format',
  'Butter Chicken':       'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=280&fit=crop&auto=format',
  'Biryani':              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=280&fit=crop&auto=format',
  'Dal Makhani':          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=280&fit=crop&auto=format',
  'Gulab Jamun':          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTrkSTYkhjRV2wggrSj3W1q_RdzdJIA8aT2w&s',
  'Chocolate Brownie':    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=280&fit=crop&auto=format',
  'Mango Lassi':          'https://images.unsplash.com/photo-1527549993586-dff825b37782?w=400&h=280&fit=crop&auto=format',
  'Cold Coffee':          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=280&fit=crop&auto=format',
  'Margherita Pizza':     'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=280&fit=crop&auto=format',
  'Chicken BBQ Pizza':    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=280&fit=crop&auto=format',
  'Veg Burger':           'https://images.unsplash.com/photo-1550950158-d0d960dff596?w=400&h=280&fit=crop&auto=format',
  'Zinger Burger':        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop&auto=format',
};

const CATEGORY_IMAGES = {
  'Starters':     'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=280&fit=crop&auto=format',
  'Main Course':  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=280&fit=crop&auto=format',
  'Desserts':     'https://images.unsplash.com/photo-1567206563114-c179706b0c04?w=400&h=280&fit=crop&auto=format',
  'Drinks':       'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=280&fit=crop&auto=format',
  'Pizza':        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=280&fit=crop&auto=format',
  'Burgers':      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop&auto=format',
};

const GENERIC_FOOD = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop&auto=format';

const FoodCard = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const cartItem = cart.find((i) => i.id === item.id);

  const handleAdd = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    addToCart(item);
    toast.success(`${item.name} added to cart!`, { icon: '🍽️' });
  };

  const getImageSrc = () => {
    if (item.image && item.image.startsWith('/uploads')) return `http://localhost:5000${item.image}`;
    if (item.image && item.image.startsWith('http')) return item.image;
    if (item.image && item.image.startsWith('data:')) return item.image;
    return FOOD_IMAGES[item.name] || CATEGORY_IMAGES[item.category_name] || GENERIC_FOOD;
  };

  const imgSrc = getImageSrc();

  return (
    <div className="food-card card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="position-relative">
        <img src={imgSrc} alt={item.name} className="card-img-top food-card-img" onError={(e) => { e.target.onerror = null; e.target.src = CATEGORY_IMAGES[item.category_name] || GENERIC_FOOD; }} />
        <div className="position-absolute top-0 start-0 m-2">
          <span className={`badge rounded-pill px-2 py-1 ${item.is_veg ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.65rem' }}>
            <FaLeaf className="me-1" />{item.is_veg ? 'VEG' : 'NON-VEG'}
          </span>
        </div>
        {item.rating > 0 && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-warning text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
              <FaStar className="me-1" />{item.rating}
            </span>
          </div>
        )}
      </div>
      <div className="card-body p-3 d-flex flex-column">
        <div className="mb-2">
          <span className="badge bg-light text-secondary rounded-pill" style={{ fontSize: '0.65rem' }}>{item.category_name}</span>
        </div>
        <h6 className="card-title fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{item.name}</h6>
        <p className="card-text text-muted small mb-3 flex-grow-1" style={{ fontSize: '0.78rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description || 'A delicious dish made with fresh ingredients.'}
        </p>
        <div className="d-flex align-items-center justify-content-between mt-auto">
          <span className="fw-bold text-danger fs-5">₹{parseFloat(item.price).toFixed(0)}</span>
          {cartItem ? (
            <div className="d-flex align-items-center gap-1">
              <button className="btn btn-sm btn-outline-danger rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}>
                <FaMinus size={10} />
              </button>
              <span className="fw-bold" style={{ minWidth: 20, textAlign: 'center' }}>{cartItem.quantity}</span>
              <button className="btn btn-sm btn-danger rounded-circle p-1" style={{ width: 28, height: 28 }} onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}>
                <FaPlus size={10} />
              </button>
            </div>
          ) : (
            <button className="btn btn-danger btn-sm rounded-pill px-3 fw-medium" onClick={handleAdd}>
              <FaShoppingCart className="me-1" size={12} />ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
