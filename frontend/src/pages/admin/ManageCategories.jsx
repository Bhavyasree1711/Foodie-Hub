import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditCat(null); setForm({ name: '', description: '' }); setImageFile(null); setShowModal(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, description: cat.description || '' }); setImageFile(null); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (imageFile) fd.append('image', imageFile);
      if (editCat) { await updateCategory(editCat.id, fd); toast.success('Category updated!'); }
      else { await createCategory(fd); toast.success('Category created!'); }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted!');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const categoryIcons = { Starters: '🥗', 'Main Course': '🍛', Desserts: '🍮', Drinks: '🥤', Pizza: '🍕', Burgers: '🍔' };

  return (
    <div className="manage-categories py-4">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Manage Categories</h3>
            <p className="text-muted mb-0">{categories.length} categories</p>
          </div>
          <button className="btn btn-danger rounded-pill px-4 fw-semibold" onClick={openAdd}>
            <FaPlus className="me-2" />Add Category
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat.id} className="col-6 col-md-4 col-lg-3">
                <div className="card border-0 shadow-sm rounded-4 text-center p-4 category-admin-card">
                  <div style={{ fontSize: '2.5rem' }}>{categoryIcons[cat.name] || '🍽️'}</div>
                  <h6 className="fw-bold mt-2 mb-1">{cat.name}</h6>
                  <p className="text-muted small mb-3" style={{ minHeight: 36 }}>{cat.description || 'No description'}</p>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-sm btn-outline-primary rounded-2" onClick={() => openEdit(cat)}><FaEdit /></button>
                    <button className="btn btn-sm btn-outline-danger rounded-2" onClick={() => handleDelete(cat.id, cat.name)}><FaTrash /></button>
                  </div>
                </div>
              </div>
            ))}
            {!categories.length && <div className="col-12 text-center py-5 text-muted">No categories found</div>}
          </div>
        )}

        {showModal && (
          <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header border-0 px-4 pt-4">
                  <h5 className="fw-bold">{editCat ? 'Edit Category' : 'Add New Category'}</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body px-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Category Name *</label>
                      <input className="form-control bg-light" placeholder="e.g. Starters" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Description</label>
                      <textarea className="form-control bg-light" rows={2} placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Image (optional)</label>
                      <input type="file" className="form-control bg-light" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                    </div>
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-danger rounded-pill px-4 fw-semibold" disabled={saving}>
                      {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                      {editCat ? 'Save Changes' : 'Add Category'}
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

export default ManageCategories;
