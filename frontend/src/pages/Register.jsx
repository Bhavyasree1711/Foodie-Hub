import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaUtensils } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      toast.success(`Welcome to FoodieHub, ${user.name}!`);
      navigate('/menu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="auth-card card border-0 shadow-lg rounded-4 p-4">
              <div className="text-center mb-4">
                <div className="auth-logo mb-3"><FaUtensils size={36} className="text-danger" /></div>
                <h3 className="fw-bold">Create Account</h3>
                <p className="text-muted small">Join FoodieHub and order delicious food!</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaUser className="text-muted" /></span>
                      <input type="text" className="form-control border-start-0 bg-light" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaEnvelope className="text-muted" /></span>
                      <input type="email" className="form-control border-start-0 bg-light" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaPhone className="text-muted" /></span>
                      <input type="tel" className="form-control border-start-0 bg-light" placeholder="+1 555 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                      <input type={showPass ? 'text' : 'password'} className="form-control border-start-0 bg-light border-end-0" placeholder="Min 6 chars" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                      <span className="input-group-text bg-light" style={{ cursor: 'pointer' }} onClick={() => setShowPass(!showPass)}>
                        {showPass ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Confirm Password</label>
                    <input type="password" className="form-control bg-light" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-danger w-100 rounded-pill py-2 fw-bold mt-4" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              <div className="text-center mt-3">
                <p className="text-muted small">Already have an account? <Link to="/login" className="text-danger fw-semibold text-decoration-none">Sign In</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
