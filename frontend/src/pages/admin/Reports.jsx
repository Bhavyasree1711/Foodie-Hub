import React, { useState } from 'react';
import { getDailyReport, getMonthlyReport } from '../../services/api';
import { FaFileCsv, FaCalendarAlt, FaChartBar, FaDownload, FaSearch, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

const downloadCSV = (filename, rows) => {
  if (!rows || rows.length === 0) { toast.error('No data to export'); return; }
  const headers = Object.keys(rows[0]).join(',');
  const body = rows
    .map(r => Object.values(r).map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([headers + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const today = new Date().toISOString().split('T')[0];
const thisMonth = new Date().getMonth() + 1;
const thisYear = new Date().getFullYear();

export default function Reports() {
  const [tab, setTab] = useState('daily');

  // Daily state
  const [date, setDate] = useState(today);
  const [dailyData, setDailyData] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);

  // Monthly state
  const [month, setMonth] = useState(String(thisMonth).padStart(2, '0'));
  const [year, setYear] = useState(String(thisYear));
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const fetchDaily = async () => {
    setDailyLoading(true);
    try {
      const { data } = await getDailyReport(date);
      setDailyData(data);
    } catch {
      toast.error('Failed to load daily report');
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchMonthly = async () => {
    setMonthlyLoading(true);
    try {
      const { data } = await getMonthlyReport(month, year);
      setMonthlyData(data);
    } catch {
      toast.error('Failed to load monthly report');
    } finally {
      setMonthlyLoading(false);
    }
  };

  const exportDailyCSV = () => {
    if (!dailyData?.orders?.length) { toast.error('No data to export'); return; }
    const rows = dailyData.orders.map(o => ({
      'Order ID': o.id,
      'Customer': o.customer_name || o.user_name || '—',
      'Amount (₹)': o.total_amount,
      'Status': o.status,
      'Payment Method': o.payment_method,
      'Delivery Agent': o.delivery_agent || '—',
      'Date': new Date(o.created_at).toLocaleString(),
    }));
    downloadCSV(`daily-report-${date}.csv`, rows);
  };

  const exportMonthlyCSV = () => {
    if (!monthlyData?.daily_summary?.length) { toast.error('No data to export'); return; }
    const rows = monthlyData.daily_summary.map(d => ({
      'Date': d.date,
      'Total Orders': d.total_orders,
      'Revenue (₹)': Number(d.revenue).toFixed(2),
      'Delivered': d.delivered || 0,
    }));
    downloadCSV(`monthly-report-${year}-${month}.csv`, rows);
  };

  const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' },
    { value: '09', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => String(thisYear - i));

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4 gap-3">
        <div className="rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#28a745,#20c997)', color: '#fff', fontSize: 22 }}>
          <FaChartBar />
        </div>
        <div>
          <h2 className="mb-0 fw-bold">Reports &amp; Analytics</h2>
          <small className="text-muted">Download daily and monthly summaries as CSV</small>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === 'daily' ? 'active' : ''}`}
            onClick={() => setTab('daily')}>
            <FaCalendarAlt className="me-2" />Daily Report
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === 'monthly' ? 'active' : ''}`}
            onClick={() => setTab('monthly')}>
            <FaChartBar className="me-2" />Monthly Report
          </button>
        </li>
      </ul>

      {/* ===================== DAILY REPORT ===================== */}
      {tab === 'daily' && (
        <div>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Select Date</label>
                  <input
                    type="date" className="form-control"
                    value={date} max={today}
                    onChange={e => { setDate(e.target.value); setDailyData(null); }} />
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={fetchDaily}
                    disabled={dailyLoading}>
                    {dailyLoading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Fetching...</>
                      : <><FaSearch className="me-2" />Generate Report</>}
                  </button>
                </div>
                {dailyData && (
                  <div className="col-md-3">
                    <button className="btn btn-success w-100" onClick={exportDailyCSV}>
                      <FaDownload className="me-2" />Export CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {dailyData && (
            <>
              {/* Summary */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Total Orders</div>
                    <div className="fw-bold fs-4 text-primary">{dailyData.total_orders ?? dailyData.orders?.length ?? 0}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Total Revenue</div>
                    <div className="fw-bold fs-4 text-success">
                      <FaRupeeSign size={14} />
                      {Number(dailyData.total_revenue ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Delivered</div>
                    <div className="fw-bold fs-4 text-info">
                      {dailyData.orders?.filter(o => o.status === 'delivered').length ?? 0}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Pending</div>
                    <div className="fw-bold fs-4 text-warning">
                      {dailyData.orders?.filter(o => o.status === 'pending').length ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              {dailyData.orders?.length === 0 ? (
                <div className="alert alert-info">No orders found for {date}.</div>
              ) : (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                    <span><FaCalendarAlt className="me-2 text-primary" />Orders on {date}</span>
                    <span className="badge bg-secondary">{dailyData.orders?.length} orders</span>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>#ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Delivery Agent</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.orders.map(o => (
                            <tr key={o.id}>
                              <td><span className="badge bg-light text-dark border">#{o.id}</span></td>
                              <td>{o.customer_name || o.user_name || '—'}</td>
                              <td>
                                <small className="text-muted">
                                  {o.items
                                    ? o.items.map(i => `${i.name} ×${i.quantity}`).join(', ')
                                    : '—'}
                                </small>
                              </td>
                              <td className="fw-semibold text-success">₹{Number(o.total_amount).toFixed(2)}</td>
                              <td>
                                <span className={`badge ${o.payment_method === 'cash' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                  {o.payment_method}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  o.status === 'delivered' ? 'bg-success' :
                                  o.status === 'pending' ? 'bg-warning text-dark' :
                                  o.status === 'cancelled' ? 'bg-danger' : 'bg-primary'}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td>{o.delivery_agent || <span className="text-muted">—</span>}</td>
                              <td><small>{new Date(o.created_at).toLocaleTimeString()}</small></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===================== MONTHLY REPORT ===================== */}
      {tab === 'monthly' && (
        <div>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Month</label>
                  <select className="form-select" value={month}
                    onChange={e => { setMonth(e.target.value); setMonthlyData(null); }}>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Year</label>
                  <select className="form-select" value={year}
                    onChange={e => { setYear(e.target.value); setMonthlyData(null); }}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={fetchMonthly}
                    disabled={monthlyLoading}>
                    {monthlyLoading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Fetching...</>
                      : <><FaSearch className="me-2" />Generate Report</>}
                  </button>
                </div>
                {monthlyData && (
                  <div className="col-md-3">
                    <button className="btn btn-success w-100" onClick={exportMonthlyCSV}>
                      <FaDownload className="me-2" />Export CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {monthlyData && (
            <>
              {/* Summary */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Total Orders</div>
                    <div className="fw-bold fs-4 text-primary">{monthlyData.total_orders ?? 0}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Total Revenue</div>
                    <div className="fw-bold fs-4 text-success">
                      <FaRupeeSign size={14} />
                      {Number(monthlyData.total_revenue ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Active Days</div>
                    <div className="fw-bold fs-4 text-info">
                      {monthlyData.daily_summary?.filter(d => d.total_orders > 0).length ?? 0}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center py-3">
                    <div className="text-muted small mb-1">Avg / Day</div>
                    <div className="fw-bold fs-4 text-warning">
                      <FaRupeeSign size={14} />
                      {monthlyData.daily_summary?.filter(d => d.total_orders > 0).length
                        ? (Number(monthlyData.total_revenue ?? 0) /
                           monthlyData.daily_summary.filter(d => d.total_orders > 0).length).toFixed(0)
                        : '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily breakdown */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
                  <span><FaCalendarAlt className="me-2 text-primary" />Daily Breakdown — {months.find(m => m.value === month)?.label} {year}</span>
                  <button className="btn btn-sm btn-outline-success" onClick={exportMonthlyCSV}>
                    <FaFileCsv className="me-1" />CSV
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Orders</th>
                          <th>Revenue</th>
                          <th>Delivered</th>
                          <th>Revenue Bar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.daily_summary?.length === 0 ? (
                          <tr><td colSpan={5} className="text-center text-muted py-4">No data for this period.</td></tr>
                        ) : (
                          (() => {
                            const maxRev = Math.max(...(monthlyData.daily_summary?.map(d => Number(d.revenue) || 0) ?? [1]));
                            return monthlyData.daily_summary?.map(d => (
                              <tr key={d.date}
                                className={Number(d.total_orders) === 0 ? 'text-muted' : ''}>
                                <td>{d.date}</td>
                                <td><span className="badge bg-primary">{d.total_orders}</span></td>
                                <td className="fw-semibold text-success">₹{Number(d.revenue).toFixed(2)}</td>
                                <td><span className="badge bg-success">{d.delivered ?? 0}</span></td>
                                <td style={{ minWidth: 120 }}>
                                  <div className="progress" style={{ height: 8 }}>
                                    <div className="progress-bar bg-success"
                                      style={{ width: maxRev ? `${(Number(d.revenue) / maxRev) * 100}%` : '0%' }} />
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Items */}
              {monthlyData.top_items?.length > 0 && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white fw-semibold">
                    <FaChartBar className="me-2 text-warning" />Top Selling Items
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Item</th>
                            <th>Quantity Sold</th>
                            <th>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyData.top_items.map((item, idx) => (
                            <tr key={item.name}>
                              <td>
                                <span className={`badge ${idx === 0 ? 'bg-warning text-dark' : idx === 1 ? 'bg-secondary' : idx === 2 ? 'bg-danger' : 'bg-light text-dark border'}`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="fw-semibold">{item.name}</td>
                              <td><span className="badge bg-primary">{item.quantity_sold}</span></td>
                              <td className="text-success fw-semibold">₹{Number(item.revenue ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
