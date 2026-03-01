import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole, getUserOrders } from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FaUsers, FaUserShield, FaUserCog, FaUser, FaHistory, FaShoppingBag, FaRupeeSign } from 'react-icons/fa';

const statusColors = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', delivered: 'success', cancelled: 'danger' };
const roleIcon = { admin: <FaUserShield className="text-danger" />, staff: <FaUserCog className="text-primary" />, customer: <FaUser className="text-secondary" /> };
const roleColors = { admin: 'danger', staff: 'primary', customer: 'secondary' };

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyUser, setHistoryUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = () => {
    getUsers().then((r) => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role, name) => {
    if (!window.confirm(`Change ${name}'s role to ${role}?`)) return;
    try {
      await updateUserRole(id, role);
      toast.success('Role updated!');
      load();
    } catch { toast.error('Failed to update role'); }
  };

  const viewHistory = async (user) => {
    setHistoryUser(user);
    setHistoryLoading(true);
    try {
      const { data } = await getUserOrders(user.id);
      setUserOrders(data);
    } catch { toast.error('Could not load order history'); }
    finally { setHistoryLoading(false); }
  };

  return (
    <div className="manage-users py-4">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <FaUsers className="text-danger" size={28} />
          <div>
            <h3 className="fw-bold mb-1">Manage Users</h3>
            <p className="text-muted mb-0">{users.length} registered users</p>
          </div>
        </div>

        {loading ? <Loader /> : (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Spent</th><th>Role</th><th>Joined</th><th>Change Role</th><th>History</th></tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user.id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
                          <span className="fw-semibold">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{user.email}</td>
                      <td className="text-muted">{user.phone || '—'}</td>
                      <td><span className="badge bg-secondary rounded-pill">{user.total_orders}</span></td>
                      <td className="fw-semibold text-danger">₹{parseFloat(user.total_spent || 0).toFixed(0)}</td>
                      <td>
                        <span className={`badge bg-${roleColors[user.role]}-subtle text-${roleColors[user.role]} rounded-pill d-flex align-items-center gap-1 w-fit px-2 py-1`} style={{ width: 'fit-content' }}>
                          {roleIcon[user.role]}<span className="ms-1 text-capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="text-muted small">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <select className="form-select form-select-sm rounded-2" style={{ width: 120 }} value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value, user.name)}>
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary rounded-2" onClick={() => viewHistory(user)} title="View order history">
                          <FaHistory size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!users.length && <tr><td colSpan={10} className="text-center text-muted py-4">No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Order History Modal */}
        {historyUser && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header border-0 px-4 pt-4">
                  <div>
                    <h5 className="fw-bold mb-1"><FaHistory className="text-primary me-2" />{historyUser.name}'s Order History</h5>
                    <p className="text-muted small mb-0">{historyUser.email}</p>
                  </div>
                  <button className="btn-close" onClick={() => setHistoryUser(null)} />
                </div>
                <div className="modal-body px-4 pb-4">
                  {historyLoading ? <Loader /> : (
                    <>
                      {/* Summary */}
                      <div className="row g-3 mb-4">
                        <div className="col-4">
                          <div className="card border-0 bg-light rounded-3 p-3 text-center">
                            <FaShoppingBag className="text-danger mb-1" />
                            <div className="fw-bold">{userOrders.length}</div>
                            <small className="text-muted">Total Orders</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="card border-0 bg-light rounded-3 p-3 text-center">
                            <FaRupeeSign className="text-success mb-1" />
                            <div className="fw-bold">₹{userOrders.reduce((s, o) => s + parseFloat(o.total_amount), 0).toFixed(0)}</div>
                            <small className="text-muted">Total Spent</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="card border-0 bg-light rounded-3 p-3 text-center">
                            <FaShoppingBag className="text-success mb-1" />
                            <div className="fw-bold">{userOrders.filter(o => o.status === 'delivered').length}</div>
                            <small className="text-muted">Delivered</small>
                          </div>
                        </div>
                      </div>

                      {userOrders.length === 0 ? (
                        <div className="text-center text-muted py-4">No orders yet</div>
                      ) : userOrders.map((order) => (
                        <div key={order.id} className="card border-0 bg-light rounded-3 mb-3 p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <span className="fw-bold">Order #{order.id}</span>
                              <span className="text-muted small ms-2">{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                            <span className={`badge bg-${statusColors[order.status] || 'secondary'} rounded-pill text-capitalize`}>{order.status}</span>
                          </div>
                          {order.items?.map((item, j) => (
                            <div key={j} className="d-flex justify-content-between small text-muted">
                              <span>{item.food_name} ×{item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                            <span className="small">
                              <span className={`badge rounded-pill ${order.payment_status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.payment_method} • {order.payment_status}</span>
                            </span>
                            <span className="fw-bold text-danger">₹{parseFloat(order.total_amount).toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
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

export default ManageUsers;
