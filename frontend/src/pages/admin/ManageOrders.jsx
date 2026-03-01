import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, getOrderById, assignDelivery } from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FaEye, FaFilter, FaTruck } from 'react-icons/fa';

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

const statusColors = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', delivered: 'success', cancelled: 'danger' };
const allStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState('');
  const [assigningDelivery, setAssigningDelivery] = useState(false);

  const load = () => {
    setLoading(true);
    getAllOrders(filterStatus ? { status: filterStatus } : {})
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      toast.success('Order status updated!');
      load();
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
    } catch { toast.error('Update failed'); }
  };

  const viewDetail = async (order) => {
    setDetailLoading(true);
    setShowDetail(true);
    setDeliveryAgent('');
    try {
      const { data } = await getOrderById(order.id);
      setSelectedOrder(data);
      setDeliveryAgent(data.delivery_agent || '');
    } catch { toast.error('Could not load order details'); }
    finally { setDetailLoading(false); }
  };

  const handleAssignDelivery = async () => {
    if (!deliveryAgent.trim()) { toast.error('Enter delivery agent name'); return; }
    setAssigningDelivery(true);
    try {
      await assignDelivery(selectedOrder.id, { delivery_agent: deliveryAgent });
      toast.success(`Delivery assigned to ${deliveryAgent}`);
      setSelectedOrder({ ...selectedOrder, delivery_agent: deliveryAgent, status: 'ready' });
      load();
    } catch { toast.error('Assignment failed'); }
    finally { setAssigningDelivery(false); }
  };

  return (
    <div className="manage-orders py-4">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1">Manage Orders</h3>
            <p className="text-muted mb-0">{orders.length} orders</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FaFilter className="text-muted" />
            <select className="form-select form-select-sm rounded-pill" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              {allStatuses.map((s) => <option key={s} value={s} className="text-capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {loading ? <Loader /> : (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>#</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Delivery Agent</th><th>Update Status</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold">#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td className="fw-bold text-danger">₹{parseFloat(order.total_amount).toFixed(0)}</td>
                      <td>
                        <span className={`badge rounded-pill ${order.payment_status === 'paid' ? 'bg-success' : order.payment_status === 'failed' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td><span className={`badge rounded-pill bg-${statusColors[order.status] || 'secondary'} text-capitalize`}>{order.status}</span></td>
                      <td>
                        {order.delivery_agent ? (
                          <span className="badge bg-info rounded-pill"><FaTruck size={10} className="me-1" />{order.delivery_agent}</span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <select className="form-select form-select-sm rounded-2" style={{ width: 140 }} value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)}>
                          {allStatuses.map((s) => <option key={s} value={s} className="text-capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td className="text-muted small">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary rounded-2" onClick={() => viewDetail(order)}><FaEye /></button>
                      </td>
                    </tr>
                  ))}
                  {!orders.length && <tr><td colSpan={9} className="text-center text-muted py-4">No orders found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetail && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header border-0 px-4 pt-4">
                  <h5 className="fw-bold">Order #{selectedOrder?.id} Details</h5>
                  <button className="btn-close" onClick={() => setShowDetail(false)} />
                </div>
                <div className="modal-body px-4 pb-4">
                  {detailLoading ? <Loader /> : selectedOrder && (
                    <>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <p className="mb-1 text-muted small">Customer</p>
                          <p className="fw-semibold">{selectedOrder.customer_name}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-1 text-muted small">Contact</p>
                          <p className="fw-semibold">{selectedOrder.customer_email}</p>
                        </div>
                        <div className="col-12">
                          <p className="mb-1 text-muted small">Delivery Address</p>
                          <p className="fw-semibold">{selectedOrder.delivery_address || 'Not provided'}</p>
                        </div>
                        {selectedOrder.special_instructions && (
                          <div className="col-12">
                            <p className="mb-1 text-muted small">Special Instructions</p>
                            <p className="fw-semibold">{selectedOrder.special_instructions}</p>
                          </div>
                        )}
                        <div className="col-12">
                          <p className="mb-1 text-muted small d-flex align-items-center gap-2"><FaTruck className="text-info" />Delivery Agent</p>
                          <div className="d-flex gap-2 align-items-center">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Assign delivery person name"
                              value={deliveryAgent}
                              onChange={(e) => setDeliveryAgent(e.target.value)}
                              style={{ maxWidth: 260 }}
                            />
                            <button
                              className="btn btn-info btn-sm rounded-pill fw-semibold"
                              onClick={handleAssignDelivery}
                              disabled={assigningDelivery}
                            >
                              {assigningDelivery ? <span className="spinner-border spinner-border-sm" /> : <><FaTruck size={11} className="me-1" />Assign</>}
                            </button>
                          </div>
                          {selectedOrder.delivery_agent && (
                            <p className="text-success small mt-1 mb-0">✓ Currently assigned to: <strong>{selectedOrder.delivery_agent}</strong></p>
                          )}
                        </div>
                      </div>
                      <h6 className="fw-bold mb-3">Ordered Items</h6>
                      {(selectedOrder.items || []).map((item) => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <img src={item.image && item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : (item.image && item.image.startsWith('http') ? item.image : (FOOD_IMAGES[item.food_name] || GENERIC_FOOD))} alt={item.food_name} className="rounded" style={{ width: 40, height: 40, objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = GENERIC_FOOD; }} />
                            <span className="fw-semibold">{item.food_name}</span>
                          </div>
                          <span className="text-muted">×{item.quantity}</span>
                          <span className="fw-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                        <span className="fw-bold fs-5">Total</span>
                        <span className="fw-bold fs-5 text-danger">₹{parseFloat(selectedOrder.total_amount).toFixed(0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
