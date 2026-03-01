import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt, FaUtensils } from 'react-icons/fa';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      if (user.role !== 'admin' && user.role !== 'staff') {
        toast.error('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome, ${user.name}! Admin access granted.`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo / Brand */}
        <div className="text-center mb-4">
          <div style={{
            width: 72, height: 72, background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(230,57,70,0.4)',
          }}>
            <FaUtensils color="#fff" size={28} />
          </div>
          <h2 className="fw-bold text-white mb-1">FoodieHub Admin</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Restricted access – authorised personnel only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '2rem',
        }}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <FaShieldAlt className="text-danger" size={18} />
            <span className="fw-bold text-white">Admin Sign In</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa' }}>
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@restaurant.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa' }}>
                  <FaLock />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter admin password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
                <span
                  className="input-group-text"
                  onClick={() => setShowPass(!showPass)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa', cursor: 'pointer' }}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 rounded-pill py-2 fw-bold"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)', color: '#fff', border: 'none' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <FaShieldAlt className="me-2" size={14} />}
              {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
            <p className="mb-1 small fw-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Default credentials:</p>
            <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              admin@restaurant.com / admin123
            </p>
          </div>
        </div>

        <p className="text-center mt-3 small" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 FoodieHub &nbsp;|&nbsp; Admin Portal
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
