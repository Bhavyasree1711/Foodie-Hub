import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../services/api';
import Loader from '../components/Loader';
import { FaBox, FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaFire, FaCreditCard } from 'react-icons/fa';
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

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: <FaClock /> },
  confirmed: { label: 'Confirmed', color: 'info', icon: <FaCheckCircle /> },
  preparing: { label: 'Preparing', color: 'primary', icon: <FaFire /> },
  ready: { label: 'Ready', color: 'success', icon: <FaCheckCircle /> },
  delivered: { label: 'Delivered', color: 'success', icon: <FaTruck /> },
  cancelled: { label: 'Cancelled', color: 'danger', icon: <FaTimesCircle /> },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrder, setPayingOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    getMyOrders().then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="py-5"><Loader text="Loading orders..." /></div>;

  return (
    <div className="orders-page py-5">
      <PaymentModal
        show={!!payingOrder}
        onClose={() => { setPayingOrder(null); fetchOrders(); }}
        orderId={payingOrder?.id}
        total={payingOrder?.total_amount}
        paymentMethod={payingOrder?.payment_method}
        orderItems={payingOrder?.items || []}
        deliveryAddress={payingOrder?.delivery_address}
      />
      <div className="container">
        <div className="d-flex align-items-center gap-3 mb-5">
          <FaBox className="text-danger" size={28} />
          <h3 className="fw-bold mb-0">My Orders</h3>
          <span className="badge bg-secondary rounded-pill">{orders.length}</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <FaBox size={80} className="text-muted mb-4" />
            <h4 className="fw-bold">No orders yet</h4>
            <p className="text-muted">You haven't placed any orders yet. Start exploring our menu!</p>
            <a href="/menu" className="btn btn-danger rounded-pill px-5 fw-bold">Browse Menu</a>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} className="col-12">
                  <div className="card border-0 shadow-sm rounded-4 order-card">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                        <div>
                          <h6 className="fw-bold mb-1">Order #{order.id}</h6>
                          <small className="text-muted">{new Date(order.created_at).toLocaleString()}</small>
                        </div>
                        <span className={`badge bg-${status.color} rounded-pill px-3 py-2`}>
                          {status.icon} <span className="ms-1">{status.label}</span>
                        </span>
                      </div>

                      {/* Order Progress Tracker */}
                      <div className="order-progress mb-4">
                        {['pending', 'confirmed', 'preparing', 'ready', 'delivered'].map((s, idx) => {
                          const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
                          const orderIdx = statuses.indexOf(order.status);
                          const isActive = idx <= orderIdx && order.status !== 'cancelled';
                          return (
                            <div key={s} className={`progress-step ${isActive ? 'active' : ''}`}>
                              <div className={`progress-dot ${isActive ? 'active' : ''}`} />
                              <small className="text-capitalize" style={{ fontSize: '0.65rem' }}>{s}</small>
                            </div>
                          );
                        })}
                      </div>

                      {/* Items */}
                      {order.items && (
                        <div className="order-items-grid mb-3">
                          {order.items.slice(0, 4).map((item) => {
                            const imgSrc = item.image && item.image.startsWith('/uploads')
                              ? `http://localhost:5000${item.image}`
                              : (item.image && item.image.startsWith('http') ? item.image : (FOOD_IMAGES[item.food_name] || GENERIC_FOOD));
                            return (
                              <div key={item.id} className="d-flex align-items-center gap-2 mb-2">
                                <img src={imgSrc} alt={item.food_name} className="rounded-2" style={{ width: 45, height: 45, objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = GENERIC_FOOD; }} />
                                <div>
                                  <p className="mb-0 fw-semibold" style={{ fontSize: '0.85rem' }}>{item.food_name}</p>
                                  <small className="text-muted">×{item.quantity} • ₹{item.price}</small>
                                </div>
                              </div>
                            );
                          })}
                          {order.items.length > 4 && <p className="text-muted small">+{order.items.length - 4} more items</p>}
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted small">Payment:</span>
                          {order.payment_status === 'paid' ? (
                            <span className="badge bg-success rounded-pill">✓ Paid</span>
                          ) : order.payment_method === 'cash' ? (
                            <span className="badge bg-secondary rounded-pill">💵 Cash on Delivery</span>
                          ) : (
                            <button
                              className="btn btn-warning btn-sm rounded-pill fw-bold px-3"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => setPayingOrder(order)}
                            >
                              <FaCreditCard size={11} className="me-1" />
                              Pay Now
                            </button>
                          )}
                        </div>
                        <div className="text-end">
                          <span className="text-muted small">Total: </span>
                          <span className="fw-bold text-danger fs-5">₹{parseFloat(order.total_amount).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
