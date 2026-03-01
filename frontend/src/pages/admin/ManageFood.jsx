import React, { useEffect, useState } from 'react';
import { getAllFoodItems, createFoodItem, updateFoodItem, deleteFoodItem, getCategories } from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaLeaf, FaTimes } from 'react-icons/fa';

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

const emptyForm = { name: '', description: '', price: '', category_id: '', is_veg: false, is_available: true };

const ManageFood = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [fi, cats] = await Promise.all([getAllFoodItems(), getCategories()]);
      setItems(fi.data);
      setCategories(cats.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setImageFile(null); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, description: item.description || '', price: item.price, category_id: item.category_id || '', is_veg: item.is_veg, is_available: item.is_available }); setImageFile(null); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editItem) { await updateFoodItem(editItem.id, fd); toast.success('Food item updated!'); }
      else { await createFoodItem(fd); toast.success('Food item created!'); }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteFoodItem(id);
      toast.success('Deleted!');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="manage-food py-4">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1">Manage Food Items</h3>
            <p className="text-muted mb-0">{items.length} items total</p>
          </div>
          <button className="btn btn-danger rounded-pill px-4 fw-semibold" onClick={openAdd}>
            <FaPlus className="me-2" />Add New Item
          </button>
        </div>

        {/* Search */}
        <div className="input-group mb-4" style={{ maxWidth: 400 }}>
          <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
          <input type="text" className="form-control bg-light border-start-0" placeholder="Search food items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="btn btn-light border" onClick={() => setSearch('')}><FaTimes className="text-muted" /></button>}
        </div>

        {loading ? <Loader /> : (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Type</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const imgSrc = item.image && item.image.startsWith('/uploads')
                      ? `http://localhost:5000${item.image}`
                      : (item.image && item.image.startsWith('http') ? item.image : (FOOD_IMAGES[item.name] || GENERIC_FOOD));
                    return (
                      <tr key={item.id}>
                        <td><img src={imgSrc} alt={item.name} className="rounded-2" style={{ width: 50, height: 50, objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = GENERIC_FOOD; }} /></td>
                        <td><div className="fw-semibold">{item.name}</div><div className="text-muted small" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div></td>
                        <td><span className="badge bg-light text-secondary rounded-pill">{item.category_name || 'N/A'}</span></td>
                        <td className="fw-bold text-danger">₹{parseFloat(item.price).toFixed(0)}</td>
                        <td><span className={`badge rounded-pill ${item.is_veg ? 'bg-success' : 'bg-danger'}`}><FaLeaf className="me-1" size={10} />{item.is_veg ? 'Veg' : 'Non-Veg'}</span></td>
                        <td><span className={`badge rounded-pill ${item.is_available ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>{item.is_available ? 'Available' : 'Unavailable'}</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary rounded-2" onClick={() => openEdit(item)}><FaEdit /></button>
                            <button className="btn btn-sm btn-outline-danger rounded-2" onClick={() => handleDelete(item.id, item.name)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filtered.length && <tr><td colSpan={7} className="text-center text-muted py-4">No items found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header border-0 pb-0 px-4 pt-4">
                  <h5 className="fw-bold">{editItem ? 'Edit Food Item' : 'Add New Food Item'}</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body px-4">
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label fw-semibold small">Item Name *</label>
                        <input className="form-control bg-light" placeholder="e.g. Butter Chicken" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold small">Price (₹) *</label>
                        <input type="number" className="form-control bg-light" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Category</label>
                        <select className="form-select bg-light" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                          <option value="">Select category</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Image</label>
                        <input type="file" className="form-control bg-light" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Description</label>
                        <textarea className="form-control bg-light" rows={2} placeholder="Describe the dish..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="isVeg" checked={form.is_veg} onChange={(e) => setForm({ ...form, is_veg: e.target.checked })} />
                          <label className="form-check-label fw-semibold small" htmlFor="isVeg">Vegetarian</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="isAvail" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
                          <label className="form-check-label fw-semibold small" htmlFor="isAvail">Available</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-danger rounded-pill px-4 fw-semibold" disabled={saving}>
                      {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                      {editItem ? 'Save Changes' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFood;
