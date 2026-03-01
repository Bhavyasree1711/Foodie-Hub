import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFoodItems, getCategories } from '../services/api';
import FoodCard from '../components/FoodCard';
import Loader from '../components/Loader';
import { FaFilter, FaTimes } from 'react-icons/fa';

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCat) params.category = selectedCat;
    if (vegOnly) params.veg = 'true';
    getFoodItems(params)
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCat, vegOnly]);

  const clearFilters = () => {
    setSelectedCat('');
    setVegOnly(false);
  };

  const hasFilters = selectedCat || vegOnly;

  return (
    <div className="menu-page py-4">
      <div className="container">
        {/* Header */}
        <div className="menu-header text-center mb-5">
          <h2 className="fw-bold display-5">Our Menu</h2>
          <p className="text-muted">Explore our delicious selection of dishes</p>
        </div>

        {/* Filters */}
        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          <div className="d-flex gap-2 flex-wrap flex-grow-1">
            <button className={`btn btn-sm rounded-pill px-3 fw-medium ${!selectedCat ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={() => setSelectedCat('')}>
              All
            </button>
            {categories.map((cat) => (
              <button key={cat.id} className={`btn btn-sm rounded-pill px-3 fw-medium ${selectedCat === String(cat.id) ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={() => setSelectedCat(selectedCat === String(cat.id) ? '' : String(cat.id))}>
                {cat.name}
              </button>
            ))}
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="form-check mb-0">
              <input type="checkbox" className="form-check-input" id="vegFilter" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
              <label className="form-check-label fw-medium small text-success" htmlFor="vegFilter">🌱 Veg Only</label>
            </div>
            {hasFilters && (
              <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={clearFilters}>
                <FaTimes className="me-1" />Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loader text="Loading menu..." />
        ) : items.length === 0 ? (
          <div className="text-center py-5">
            <p className="display-1">🍽️</p>
            <h5 className="text-muted">No items found</h5>
            <p className="text-muted">Try adjusting your filters</p>
            <button className="btn btn-danger rounded-pill px-4" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <p className="text-muted small mb-3"><FaFilter className="me-1" />{items.length} item{items.length !== 1 ? 's' : ''} found</p>
            <div className="row g-4">
              {items.map((item) => (
                <div key={item.id} className="col-6 col-md-4 col-lg-3">
                  <FoodCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;
