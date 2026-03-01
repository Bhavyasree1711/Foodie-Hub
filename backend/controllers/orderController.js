const db = require('../config/db');

// @POST /api/orders
const placeOrder = async (req, res) => {
  const { items, delivery_address, payment_method, special_instructions } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'No items in order' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    for (const item of items) {
      const [[food]] = await conn.query('SELECT price FROM food_items WHERE id = ? AND is_available = TRUE', [item.food_item_id]);
      if (!food) { await conn.rollback(); return res.status(400).json({ message: `Item ${item.food_item_id} not available` }); }
      total += food.price * item.quantity;
    }
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, delivery_address, payment_method, special_instructions) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, total, delivery_address || null, payment_method || 'cash', special_instructions || null]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      const [[food]] = await conn.query('SELECT price FROM food_items WHERE id = ?', [item.food_item_id]);
      await conn.query(
        'INSERT INTO order_items (order_id, food_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.food_item_id, item.quantity, food.price]
      );
    }
    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
};

// @GET /api/orders/my (customer)
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, f.name AS food_name, f.image FROM order_items oi 
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

// @GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });
    const order = orders[0];
    if (req.user.role === 'customer' && order.user_id !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    const [items] = await db.query(
      `SELECT oi.*, f.name AS food_name, f.image FROM order_items oi 
       JOIN food_items f ON oi.food_item_id = f.id WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/orders (admin/staff)
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  try {
    let query = `SELECT o.*, u.name AS customer_name FROM orders o JOIN users u ON o.user_id = u.id`;
    const params = [];
    if (status) { query += ' WHERE o.status = ?'; params.push(status); }
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const [orders] = await db.query(query, params);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @PUT /api/orders/:id/status (admin/staff)
const updateOrderStatus = async (req, res) => {
  const { status, payment_status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  try {
    const updates = [];
    const values = [];
    if (status) { updates.push('status = ?'); values.push(status); }
    if (payment_status) { updates.push('payment_status = ?'); values.push(payment_status); }
    if (!updates.length) return res.status(400).json({ message: 'No updates provided' });
    values.push(req.params.id);
    await db.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @PUT /api/orders/:id/pay (customer – mark own order as paid)
const payOrder = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });
    if (orders[0].payment_status === 'paid') return res.status(400).json({ message: 'Already paid' });
    await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', ['paid', req.params.id]);
    const [updated] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    const order = updated[0];
    const [items] = await db.query(
      `SELECT oi.*, f.name AS food_name, f.image FROM order_items oi
       JOIN food_items f ON oi.food_item_id = f.id WHERE oi.order_id = ?`,
      [req.params.id]
    );
    order.items = items;
    res.json({ message: 'Payment successful', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @PUT /api/orders/:id/delivery (admin/staff - assign delivery agent)
const assignDelivery = async (req, res) => {
  const { delivery_agent, delivery_note } = req.body;
  if (!delivery_agent) return res.status(400).json({ message: 'delivery_agent is required' });
  try {
    await db.query(
      'UPDATE orders SET delivery_agent = ?, delivery_note = ?, status = ? WHERE id = ?',
      [delivery_agent, delivery_note || null, 'ready', req.params.id]
    );
    res.json({ message: 'Delivery agent assigned' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, payOrder, assignDelivery };
