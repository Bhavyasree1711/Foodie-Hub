import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Food Items
export const getFoodItems = (params) => API.get('/food', { params });
export const getAllFoodItems = () => API.get('/food/all');
export const getFoodById = (id) => API.get(`/food/${id}`);
export const createFoodItem = (data) => API.post('/food', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateFoodItem = (id, data) => API.put(`/food/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteFoodItem = (id) => API.delete(`/food/${id}`);

// Orders
export const placeOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const getAllOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);
export const payOrder = (id) => API.put(`/orders/${id}/pay`);

// Admin
export const getDashboard = () => API.get('/admin/dashboard');
export const getUsers = () => API.get('/admin/users');
export const getUserOrders = (id) => API.get(`/admin/users/${id}/orders`);
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const getDailyReport = (date) => API.get('/admin/reports/daily', { params: { date } });
export const getMonthlyReport = (month, year) => API.get('/admin/reports/monthly', { params: { month, year } });
export const assignDelivery = (id, data) => API.put(`/orders/${id}/delivery`, data);

export default API;
