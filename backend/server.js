const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');

const app = express();

// Run DB migrations on startup
(async () => {
  try {
    await db.query('ALTER TABLE orders ADD COLUMN delivery_agent VARCHAR(100) NULL');
  } catch (e) { /* column likely already exists */ }
  try {
    await db.query('ALTER TABLE orders ADD COLUMN delivery_note TEXT NULL');
  } catch (e) { /* column likely already exists */ }
  try {
    await db.query('ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP NULL');
  } catch (e) { /* column likely already exists */ }
})();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Restaurant API is running' }));

// 404 Handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
