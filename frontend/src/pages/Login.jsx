import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUtensils } from 'react-icons/fa';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="auth-card card border-0 shadow-lg rounded-4 p-4">
              <div className="text-center mb-4">
                <div className="auth-logo mb-3">
                  <FaUtensils size={36} className="text-danger" />
                </div>
                <h3 className="fw-bold">Welcome Back!</h3>
                <p className="text-muted small">Sign in to your FoodieHub account</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaEnvelope className="text-muted" /></span>
                    <input type="email" className="form-control border-start-0 bg-light" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                    <input type={showPass ? 'text' : 'password'} className="form-control border-start-0 bg-light border-end-0" placeholder="Enter password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    <span className="input-group-text bg-light cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => setShowPass(!showPass)}>
                      {showPass ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                    </span>
                  </div>
                </div>
                <button type="submit" className="btn btn-danger w-100 rounded-pill py-2 fw-bold" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <div className="text-center mt-3">
                
                <p className="text-muted small mb-1">Don't have an account? <Link to="/register" className="text-danger fw-semibold text-decoration-none">Sign Up</Link></p>
                <p className="text-muted small">Are you an admin? <Link to="/admin/login" className="text-dark fw-semibold text-decoration-none">Admin Login →</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
