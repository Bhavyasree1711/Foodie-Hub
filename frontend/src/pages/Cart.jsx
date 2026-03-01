import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaMapMarkerAlt, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import PaymentModal from '../components/PaymentModal';

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
const GENERIC_FOOD = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop&auto=format';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [pendingTotal, setPendingTotal] = useState(0);

  const deliveryFee = cartTotal > 299 ? 0 : 40;
  const tax = cartTotal * 0.05;
  const grandTotal = cartTotal + deliveryFee + tax;

  const handleOrder = async () => {
    if (!address.trim()) { toast.error('Please enter delivery address'); return; }
    setLoading(true);
    try {
      const items = cart.map((i) => ({ food_item_id: i.id, quantity: i.quantity }));
      const { data } = await placeOrder({
        items,
        delivery_address: address,
        payment_method: paymentMethod,
        special_instructions: instructions,
      });

      if (paymentMethod === 'cash') {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        // card or UPI — open payment modal
        clearCart();
        setPendingOrderId(data.orderId);
        setPendingTotal(grandTotal);
        setShowPayment(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-5 my-5">
        <FaShoppingBag size={80} className="text-muted mb-4" />
        <h3 className="fw-bold">Your cart is empty</h3>
        <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
        <button className="btn btn-danger rounded-pill px-5 fw-bold py-2" onClick={() => navigate('/menu')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <>
      <PaymentModal
        show={showPayment}
        onClose={handlePaymentClose}
        orderId={pendingOrderId}
        total={pendingTotal}
        paymentMethod={paymentMethod}
        orderItems={[]}
        deliveryAddress={address}
      />
      <div className="cart-page py-5">
      <div className="container">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn btn-link text-dark p-0" onClick={() => navigate('/menu')}><FaArrowLeft /> Back to Menu</button>
          <h3 className="fw-bold mb-0">Your Cart</h3>
          <span className="badge bg-danger rounded-pill">{cart.length} items</span>
        </div>
        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                {cart.map((item) => {
                  const imgSrc = item.image && item.image.startsWith('/uploads')
                    ? `http://localhost:5000${item.image}`
                    : (item.image && item.image.startsWith('http') ? item.image : (FOOD_IMAGES[item.name] || GENERIC_FOOD));
                  return (
                    <div key={item.id} className="cart-item-row d-flex align-items-center gap-3 py-3 border-bottom">
                      <img src={imgSrc} alt={item.name} className="rounded-3" style={{ width: 75, height: 75, objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = GENERIC_FOOD; }} />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <p className="text-muted small mb-0">₹{item.price} each</p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-outline-secondary btn-sm rounded-circle p-0" style={{ width: 30, height: 30 }} onClick={() => updateQuantity(item.id, item.quantity - 1)}><FaMinus size={10} /></button>
                        <span className="fw-bold" style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                        <button className="btn btn-danger btn-sm rounded-circle p-0" style={{ width: 30, height: 30 }} onClick={() => updateQuantity(item.id, item.quantity + 1)}><FaPlus size={10} /></button>
                      </div>
                      <span className="fw-bold text-danger" style={{ minWidth: 60, textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                      <button className="btn btn-link text-danger p-0" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 mb-3">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4"><FaMapMarkerAlt className="text-danger me-2" />Delivery Details</h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Delivery Address *</label>
                  <textarea className="form-control bg-light" rows={3} placeholder="Enter full delivery address..." value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Special Instructions</label>
                  <input type="text" className="form-control bg-light" placeholder="E.g., no spicy, extra sauce..." value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                </div>
                <div>
                  <label className="form-label fw-semibold small"><FaCreditCard className="me-1" />Payment Method</label>
                  <div className="d-flex gap-3">
                    {['cash', 'card', 'online'].map((method) => (
                      <div key={method} className="form-check">
                        <input type="radio" className="form-check-input" id={method} name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                        <label className="form-check-label text-capitalize fw-medium small" htmlFor={method}>{method === 'cash' ? '💵 Cash' : method === 'card' ? '💳 Card' : '📱 Online'}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Subtotal</span><span>₹{cartTotal.toFixed(0)}</span></div>
                <div className="d-flex justify-content-between mb-2"><span className="text-muted">Delivery</span><span className={deliveryFee === 0 ? 'text-success fw-semibold' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div className="d-flex justify-content-between mb-3"><span className="text-muted">Tax (5%)</span><span>₹{tax.toFixed(0)}</span></div>
                {deliveryFee > 0 && <p className="small text-muted mb-3">Add ₹{(299 - cartTotal).toFixed(0)} more for free delivery!</p>}
                <hr />
                <div className="d-flex justify-content-between mb-4"><span className="fw-bold fs-5">Total</span><span className="fw-bold fs-5 text-danger">₹{grandTotal.toFixed(0)}</span></div>
                <button className="btn btn-danger w-100 rounded-pill py-3 fw-bold fs-5" onClick={handleOrder} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {loading ? 'Placing Order...' : paymentMethod === 'cash' ? `Place Order • ₹${grandTotal.toFixed(0)}` : `Proceed to Pay • ₹${grandTotal.toFixed(0)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Cart;
