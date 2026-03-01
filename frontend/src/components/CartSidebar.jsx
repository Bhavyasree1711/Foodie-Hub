import React from 'react';
import { useCart } from '../context/CartContext';
import { FaTimes, FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FOOD_IMAGES = {
  'Veg Spring Rolls':     'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=100&h=100&fit=crop&auto=format',
  'Chicken Tikka':        'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=100&h=100&fit=crop&auto=format',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop&auto=format',
  'Butter Chicken':       'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=100&h=100&fit=crop&auto=format',
  'Biryani':              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&h=100&fit=crop&auto=format',
  'Dal Makhani':          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&h=100&fit=crop&auto=format',
  'Gulab Jamun':          'https://images.unsplash.com/photo-1666362861481-0a74e78db001?w=100&h=100&fit=crop&auto=format',
  'Chocolate Brownie':    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=100&h=100&fit=crop&auto=format',
  'Mango Lassi':          'https://images.unsplash.com/photo-1527549993586-dff825b37782?w=100&h=100&fit=crop&auto=format',
  'Cold Coffee':          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=100&h=100&fit=crop&auto=format',
  'Margherita Pizza':     'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100&h=100&fit=crop&auto=format',
  'Chicken BBQ Pizza':    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop&auto=format',
  'Veg Burger':           'https://images.unsplash.com/photo-1550950158-d0d960dff596?w=100&h=100&fit=crop&auto=format',
  'Zinger Burger':        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop&auto=format',
};
const GENERIC_FOOD = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop&auto=format';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header d-flex justify-content-between align-items-center p-3">
          <div className="d-flex align-items-center gap-2">
            <FaShoppingBag className="text-danger" />
            <h5 className="mb-0 fw-bold">Your Cart</h5>
            <span className="badge bg-danger rounded-pill">{cart.length}</span>
          </div>
          <button className="btn btn-link p-0 text-dark" onClick={onClose}><FaTimes size={20} /></button>
        </div>
        <div className="cart-sidebar-body p-3">
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <FaShoppingBag size={60} className="text-muted mb-3" />
              <p className="text-muted">Your cart is empty</p>
              <button className="btn btn-danger rounded-pill px-4" onClick={onClose}>Browse Menu</button>
            </div>
          ) : (
            <>
              {cart.map((item) => {
                    const imgSrc = item.image && item.image.startsWith('/uploads')
                      ? `http://localhost:5000${item.image}`
                      : (item.image && item.image.startsWith('http') ? item.image : (FOOD_IMAGES[item.name] || GENERIC_FOOD));
                return (
                  <div key={item.id} className="cart-item d-flex align-items-center gap-3 mb-3 p-2 rounded-3 bg-light">
                    <img src={imgSrc} alt={item.name} className="rounded-2" style={{ width: 55, height: 55, objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = GENERIC_FOOD; }} />
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-semibold" style={{ fontSize: '0.85rem' }}>{item.name}</p>
                      <p className="mb-0 text-danger fw-bold" style={{ fontSize: '0.8rem' }}>₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <button className="btn btn-sm btn-outline-secondary rounded-circle p-0" style={{ width: 24, height: 24, fontSize: 10 }} onClick={() => updateQuantity(item.id, item.quantity - 1)}><FaMinus size={8} /></button>
                      <span style={{ fontSize: '0.85rem', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                      <button className="btn btn-sm btn-danger rounded-circle p-0" style={{ width: 24, height: 24, fontSize: 10 }} onClick={() => updateQuantity(item.id, item.quantity + 1)}><FaPlus size={8} /></button>
                    </div>
                    <button className="btn btn-link text-danger p-0" onClick={() => removeFromCart(item.id)}><FaTrash size={14} /></button>
                  </div>
                );
              })}
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-sidebar-footer p-3 border-top">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-semibold">Total</span>
              <span className="fw-bold text-danger fs-5">₹{cartTotal.toFixed(0)}</span>
            </div>
            <button className="btn btn-danger w-100 rounded-pill fw-bold py-2 mb-2" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <button className="btn btn-outline-secondary w-100 rounded-pill btn-sm" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
