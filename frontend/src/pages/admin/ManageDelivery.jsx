import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus, assignDelivery } from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FaTruck, FaSync, FaCheckCircle, FaTimesCircle, FaMotorcycle } from 'react-icons/fa';

const statusColors = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', delivered: 'success', cancelled: 'danger' };

const AGENTS = ['Ravi Kumar', 'Suresh Babu', 'Manoj Singh', 'Priya Devi', 'Alok Sharma', 'Neha Yadav'];

const ManageDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const [agentInputs, setAgentInputs] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    // Load orders that are in progress (not cancelled, delivered)
    getAllOrders({})
      .then((r) => setOrders(r.data.filter((o) => o.status !== 'cancelled')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleAssign = async (orderId) => {
    const agent = agentInputs[orderId] || '';
    if (!agent.trim()) { toast.error('Select or enter a delivery agent'); return; }
    setAssigning((p) => ({ ...p, [orderId]: true }));
    try {
      await assignDelivery(orderId, { delivery_agent: agent });
      toast.success(`Assigned to ${agent}`);
      load();
    } catch { toast.error('Assignment failed'); }
    finally { setAssigning((p) => ({ ...p, [orderId]: false })); }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { status: 'delivered' });
      toast.success('Order marked as delivered!');
      load();
    } catch { toast.error('Update failed'); }
  };

  const pending = orders.filter((o) => !o.delivery_agent && o.status !== 'delivered');
  const assigned = orders.filter((o) => o.delivery_agent && o.status !== 'delivered');
  const delivered = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="manage-delivery py-4">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1"><FaTruck className="text-info me-2" />Delivery Management</h3>
            <p className="text-muted mb-0">Assign agents and track all deliveries</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={load}>
            <FaSync size={11} className="me-1" />Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 bg-warning bg-opacity-10">
              <div className="card-body p-3 text-center">
                <FaMotorcycle size={24} className="text-warning mb-2" />
                <h4 className="fw-bold mb-0">{pending.length}</h4>
                <p className="text-muted small mb-0">Unassigned</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 bg-info bg-opacity-10">
              <div className="card-body p-3 text-center">
                <FaTruck size={24} className="text-info mb-2" />
                <h4 className="fw-bold mb-0">{assigned.length}</h4>
                <p className="text-muted small mb-0">Out for Delivery</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 bg-success bg-opacity-10">
              <div className="card-body p-3 text-center">
                <FaCheckCircle size={24} className="text-success mb-2" />
                <h4 className="fw-bold mb-0">{delivered.length}</h4>
                <p className="text-muted small mb-0">Delivered</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4" style={{ background: '#f8f9fa' }}>
              <div className="card-body p-3 text-center">
                <FaTruck size={24} className="text-secondary mb-2" />
                <h4 className="fw-bold mb-0">{orders.length}</h4>
                <p className="text-muted small mb-0">Total Active</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? <Loader /> : (
          <div className="row g-4">
            {/* Unassigned Orders */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-warning bg-opacity-10 border-0 rounded-top-4 p-3">
                  <h6 className="fw-bold mb-0 text-warning">⚠ Unassigned Orders ({pending.length})</h6>
                </div>
                <div className="card-body p-0">
                  {pending.length === 0 ? (
                    <p className="text-muted text-center py-4">All orders are assigned!</p>
                  ) : pending.map((order) => (
                    <div key={order.id} className="p-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="fw-bold">#{order.id}</span>
                          <span className="text-muted small ms-2">{order.customer_name}</span>
                        </div>
                        <span className={`badge bg-${statusColors[order.status]} rounded-pill text-capitalize`}>{order.status}</span>
                      </div>
                      {order.delivery_address && (
                        <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>📍 {order.delivery_address}</p>
                      )}
                      <div className="d-flex gap-2 align-items-center mt-2">
                        <select
                          className="form-select form-select-sm rounded-pill"
                          value={agentInputs[order.id] || ''}
                          onChange={(e) => setAgentInputs((p) => ({ ...p, [order.id]: e.target.value }))}
                          style={{ fontSize: '0.8rem' }}
                        >
                          <option value="">-- Select Agent --</option>
                          {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <input
                          className="form-control form-control-sm rounded-pill"
                          placeholder="Or type name"
                          value={agentInputs[order.id] || ''}
                          onChange={(e) => setAgentInputs((p) => ({ ...p, [order.id]: e.target.value }))}
                          style={{ fontSize: '0.8rem', maxWidth: 140 }}
                        />
                        <button
                          className="btn btn-info btn-sm rounded-pill fw-semibold"
                          onClick={() => handleAssign(order.id)}
                          disabled={assigning[order.id]}
                        >
                          {assigning[order.id] ? <span className="spinner-border spinner-border-sm" /> : 'Assign'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned / Out for Delivery */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-info bg-opacity-10 border-0 rounded-top-4 p-3">
                  <h6 className="fw-bold mb-0 text-info">🚴 Out for Delivery ({assigned.length})</h6>
                </div>
                <div className="card-body p-0">
                  {assigned.length === 0 ? (
                    <p className="text-muted text-center py-4">No active deliveries</p>
                  ) : assigned.map((order) => (
                    <div key={order.id} className="p-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="fw-bold">#{order.id}</span>
                          <span className="text-muted small ms-2">{order.customer_name}</span>
                        </div>
                        <button
                          className="btn btn-success btn-sm rounded-pill fw-semibold"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleMarkDelivered(order.id)}
                        >
                          <FaCheckCircle size={11} className="me-1" />Mark Delivered
                        </button>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <FaTruck size={13} className="text-info" />
                        <span className="fw-semibold small text-info">{order.delivery_agent}</span>
                        <span className="badge bg-info rounded-pill" style={{ fontSize: '0.65rem' }}>Active</span>
                      </div>
                      {order.delivery_address && (
                        <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.75rem' }}>📍 {order.delivery_address}</p>
                      )}
                      <div className="mt-2">
                        <span className="fw-bold text-danger">₹{parseFloat(order.total_amount).toFixed(0)}</span>
                        <span className="text-muted small ms-2">{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivered History */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-success bg-opacity-10 border-0 rounded-top-4 p-3">
                  <h6 className="fw-bold mb-0 text-success">✅ Delivered Orders ({delivered.length})</h6>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr><th>#</th><th>Customer</th><th>Delivery Agent</th><th>Address</th><th>Amount</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {delivered.slice(0, 20).map((order) => (
                        <tr key={order.id}>
                          <td className="fw-bold">#{order.id}</td>
                          <td>{order.customer_name}</td>
                          <td>
                            {order.delivery_agent ? (
                              <span className="badge bg-success rounded-pill">
                                <FaTruck size={10} className="me-1" />{order.delivery_agent}
                              </span>
                            ) : <span className="text-muted">—</span>}
                          </td>
                          <td className="text-muted small" style={{ maxWidth: 200 }}>{order.delivery_address || '—'}</td>
                          <td className="fw-bold text-danger">₹{parseFloat(order.total_amount).toFixed(0)}</td>
                          <td className="text-muted small">{new Date(order.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                      {!delivered.length && <tr><td colSpan={6} className="text-center text-muted py-4">No deliveries yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDelivery;
