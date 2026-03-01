import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/api';
import Loader from '../../components/Loader';
import { FaShoppingBag, FaUsers, FaRupeeSign, FaUtensils, FaChartBar, FaClipboardList, FaConciergeBell, FaTags, FaTruck, FaBoxOpen, FaExclamationTriangle, FaSync, FaCalendarDay } from 'react-icons/fa';

const statusColors = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', delivered: 'success', cancelled: 'danger' };

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const r = await getDashboard();
      setData(r.data);
      setLastUpdated(new Date());
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <div className="py-5"><Loader /></div>;

  const statsRow1 = [
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: <FaShoppingBag />, color: 'danger', bg: '#fff5f5' },
    { label: 'Total Revenue', value: `₹${parseFloat(data?.totalRevenue || 0).toFixed(0)}`, icon: <FaRupeeSign />, color: 'success', bg: '#f0fff4' },
    { label: 'Customers', value: data?.totalUsers || 0, icon: <FaUsers />, color: 'primary', bg: '#f0f4ff' },
    { label: 'Menu Items', value: data?.totalFoodItems || 0, icon: <FaUtensils />, color: 'warning', bg: '#fffbf0' },
  ];
  const statsRow2 = [
    { label: "Today's Orders", value: data?.todayOrders || 0, icon: <FaCalendarDay />, color: 'info', bg: '#f0fcff' },
    { label: "Today's Revenue", value: `₹${parseFloat(data?.todayRevenue || 0).toFixed(0)}`, icon: <FaRupeeSign />, color: 'success', bg: '#f0fff4' },
    { label: 'Pending Orders', value: data?.pendingOrders || 0, icon: <FaExclamationTriangle />, color: 'warning', bg: '#fffbf0' },
    { label: 'Delivered Today', value: data?.deliveredToday || 0, icon: <FaTruck />, color: 'success', bg: '#f0fff4' },
    { label: 'In Stock', value: data?.availableItems || 0, icon: <FaBoxOpen />, color: 'success', bg: '#f0fff4' },
    { label: 'Out of Stock', value: data?.outOfStockItems || 0, icon: <FaExclamationTriangle />, color: 'danger', bg: '#fff5f5' },
  ];

  return (
    <div className="admin-dashboard py-4">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Admin Dashboard</h3>
            <p className="text-muted mb-0">Real-time overview of your restaurant</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {lastUpdated && (
              <small className="text-muted">
                {refreshing ? 'Refreshing…' : `Updated ${lastUpdated.toLocaleTimeString()}`}
              </small>
            )}
            <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => fetchData(true)} disabled={refreshing}>
              <FaSync className={refreshing ? 'fa-spin me-1' : 'me-1'} size={11} />Refresh
            </button>
            <Link to="/admin/orders" className="btn btn-danger rounded-pill px-4 fw-semibold">
              <FaClipboardList className="me-2" />Orders
            </Link>
          </div>
        </div>

        {/* Stats Row 1 */}
        <div className="row g-3 mb-3">
          {statsRow1.map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: s.bg }}>
                <div className="card-body p-3">
                  <div className={`text-${s.color} mb-2`} style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                  <h4 className="fw-bold mb-0">{s.value}</h4>
                  <p className="text-muted small mb-0">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row 2 - Today & Stock */}
        <div className="row g-3 mb-4">
          {statsRow2.map((s, i) => (
            <div key={i} className="col-6 col-md-2">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: s.bg }}>
                <div className="card-body p-3">
                  <div className={`text-${s.color} mb-1`} style={{ fontSize: '1.1rem' }}>{s.icon}</div>
                  <h5 className="fw-bold mb-0">{s.value}</h5>
                  <p className="text-muted" style={{ fontSize: '0.72rem' }}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          {/* Quick Links */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2"><FaChartBar className="text-danger" />Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Link to="/admin/food" className="btn btn-outline-danger rounded-3 fw-semibold text-start">
                    <FaConciergeBell className="me-2" />Food &amp; Stock
                  </Link>
                  <Link to="/admin/categories" className="btn btn-outline-primary rounded-3 fw-semibold text-start">
                    <FaTags className="me-2" />Manage Categories
                  </Link>
                  <Link to="/admin/orders" className="btn btn-outline-success rounded-3 fw-semibold text-start">
                    <FaClipboardList className="me-2" />View All Orders
                  </Link>
                  <Link to="/admin/delivery" className="btn btn-outline-info rounded-3 fw-semibold text-start">
                    <FaTruck className="me-2" />Manage Deliveries
                  </Link>
                  <Link to="/admin/users" className="btn btn-outline-warning rounded-3 fw-semibold text-start">
                    <FaUsers className="me-2" />Manage Users
                  </Link>
                  <Link to="/admin/reports" className="btn btn-outline-secondary rounded-3 fw-semibold text-start">
                    <FaChartBar className="me-2" />CSV Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Orders by Status</h5>
                {(data?.ordersByStatus || []).map((s) => (
                  <div key={s.status} className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge bg-${statusColors[s.status] || 'secondary'} rounded-pill px-3 py-2 text-capitalize`}>{s.status}</span>
                    <span className="fw-bold">{s.count}</span>
                  </div>
                ))}
                {(!data?.ordersByStatus?.length) && <p className="text-muted">No orders yet</p>}
              </div>
            </div>
          </div>

          {/* Top Items */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">🔥 Top Selling Items</h5>
                {(data?.topItems || []).map((item, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-danger rounded-circle" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                      <span className="fw-semibold small">{item.name}</span>
                    </div>
                    <span className="text-muted small">{item.total_ordered} sold</span>
                  </div>
                ))}
                {(!data?.topItems?.length) && <p className="text-muted">No data yet</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Recent Orders</h5>
              <Link to="/admin/orders" className="btn btn-sm btn-outline-danger rounded-pill">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentOrders || []).map((o) => (
                    <tr key={o.id}>
                      <td><span className="fw-bold">#{o.id}</span></td>
                      <td>{o.customer_name}</td>
                      <td className="fw-bold text-danger">₹{parseFloat(o.total_amount).toFixed(0)}</td>
                      <td><span className={`badge bg-${statusColors[o.status] || 'secondary'} rounded-pill text-capitalize`}>{o.status}</span></td>
                      <td className="text-muted small">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!data?.recentOrders?.length && <tr><td colSpan={5} className="text-center text-muted py-3">No orders yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
