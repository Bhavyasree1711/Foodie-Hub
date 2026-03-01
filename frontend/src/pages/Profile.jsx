import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getProfile } from '../services/api';
import toast from 'react-hot-toast';
import { FaUserCircle, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((r) => setForm({ name: r.data.name, phone: r.data.phone || '', address: r.data.address || '' })).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const roleColors = { admin: 'danger', staff: 'primary', customer: 'success' };

  return (
    <div className="profile-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="profile-avatar mb-3">
                    <FaUserCircle size={90} className="text-muted" />
                  </div>
                  <h4 className="fw-bold mb-1">{form.name || user?.name}</h4>
                  <p className="text-muted mb-2">{user?.email}</p>
                  <span className={`badge bg-${roleColors[user?.role] || 'secondary'} rounded-pill px-3 text-capitalize`}>{user?.role}</span>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Full Name</label>
                    <input className={`form-control ${editing ? 'bg-light' : 'bg-white border-0'}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!editing} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Email</label>
                    <input className="form-control bg-white border-0" value={user?.email} disabled />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Phone</label>
                    <input className={`form-control ${editing ? 'bg-light' : 'bg-white border-0'}`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={!editing} placeholder="Add phone number" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Address</label>
                    <textarea className={`form-control ${editing ? 'bg-light' : 'bg-white border-0'}`} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={!editing} placeholder="Add delivery address" />
                  </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                  {editing ? (
                    <>
                      <button className="btn btn-danger flex-grow-1 rounded-pill fw-semibold" onClick={handleSave} disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <FaSave className="me-2" />}
                        Save Changes
                      </button>
                      <button className="btn btn-light rounded-pill px-4" onClick={() => setEditing(false)}><FaTimes /></button>
                    </>
                  ) : (
                    <button className="btn btn-outline-danger flex-grow-1 rounded-pill fw-semibold" onClick={() => setEditing(true)}>
                      <FaEdit className="me-2" />Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
