const db = require('../config/db');

// @GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ availableItems }]] = await db.query('SELECT COUNT(*) AS availableItems FROM food_items WHERE is_available = TRUE');
    const [[{ outOfStockItems }]] = await db.query('SELECT COUNT(*) AS outOfStockItems FROM food_items WHERE is_available = FALSE');
    const [[{ todayOrders }]] = await db.query("SELECT COUNT(*) AS todayOrders FROM orders WHERE DATE(created_at) = CURDATE()");
    const [[{ todayRevenue }]] = await db.query("SELECT COALESCE(SUM(total_amount),0) AS todayRevenue FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'");
    const [[{ pendingOrders }]] = await db.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'pending'");
    const [[{ deliveredToday }]] = await db.query("SELECT COUNT(*) AS deliveredToday FROM orders WHERE status = 'delivered' AND DATE(updated_at) = CURDATE()");
    const [[{ totalRevenue }]] = await db.query("SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status != 'cancelled'");
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'customer'");
    const [[{ totalFoodItems }]] = await db.query('SELECT COUNT(*) AS totalFoodItems FROM food_items');
    const [recentOrders] = await db.query(
      'SELECT o.*, u.name AS customer_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5'
    );
    const [ordersByStatus] = await db.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
    const [topItems] = await db.query(`
      SELECT f.name, SUM(oi.quantity) AS total_ordered
      FROM order_items oi JOIN food_items f ON oi.food_item_id = f.id
      GROUP BY f.id ORDER BY total_ordered DESC LIMIT 5
    `);
    res.json({
      totalOrders, totalRevenue, totalUsers, totalFoodItems,
      availableItems, outOfStockItems, todayOrders, todayRevenue,
      pendingOrders, deliveredToday,
      recentOrders, ordersByStatus, topItems,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.name, u.email, u.role, u.phone, u.address, u.created_at,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.total_amount),0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ['customer', 'admin', 'staff'];
  if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/admin/users/:id/orders
const getUserOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, f.name AS food_name FROM order_items oi
         JOIN food_items f ON oi.food_item_id = f.id WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/admin/reports/daily?date=YYYY-MM-DD
const getDailyReport = async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const [orders] = await db.query(
      `SELECT o.id, u.name AS customer_name, u.email, u.phone, o.total_amount, o.status,
              o.payment_method, o.payment_status, o.delivery_address,
              o.delivery_agent, o.created_at
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE DATE(o.created_at) = ? ORDER BY o.created_at ASC`,
      [date]
    );
    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled'",
      [date]
    );
    const [[{ total_orders }]] = await db.query(
      'SELECT COUNT(*) AS total_orders FROM orders WHERE DATE(created_at) = ?', [date]
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT f.name AS food_name, oi.quantity, oi.price FROM order_items oi
         JOIN food_items f ON oi.food_item_id = f.id WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    res.json({ date, total_orders, total_revenue, orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/admin/reports/monthly?month=MM&year=YYYY
const getMonthlyReport = async (req, res) => {
  const month = req.query.month || String(new Date().getMonth() + 1).padStart(2, '0');
  const year = req.query.year || new Date().getFullYear();
  try {
    const [dailySummary] = await db.query(
      `SELECT DATE(created_at) AS day,
              COUNT(*) AS total_orders,
              COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END),0) AS revenue,
              SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
              SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
       FROM orders WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
       GROUP BY DATE(created_at) ORDER BY day ASC`,
      [month, year]
    );
    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM orders WHERE MONTH(created_at)=? AND YEAR(created_at)=? AND status != 'cancelled'",
      [month, year]
    );
    const [[{ total_orders }]] = await db.query(
      'SELECT COUNT(*) AS total_orders FROM orders WHERE MONTH(created_at)=? AND YEAR(created_at)=?',
      [month, year]
    );
    const [topItems] = await db.query(
      `SELECT f.name, SUM(oi.quantity) AS qty, SUM(oi.price * oi.quantity) AS revenue
       FROM order_items oi JOIN food_items f ON oi.food_item_id = f.id
       JOIN orders o ON oi.order_id = o.id
       WHERE MONTH(o.created_at)=? AND YEAR(o.created_at)=?
       GROUP BY f.id ORDER BY qty DESC LIMIT 10`,
      [month, year]
    );
    res.json({ month, year, total_orders, total_revenue, dailySummary, topItems });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboard, getUsers, getUserOrders, updateUserRole, getDailyReport, getMonthlyReport };
