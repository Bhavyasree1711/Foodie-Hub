const db = require('../config/db');

// @GET /api/food
const getFoodItems = async (req, res) => {
  const { category, search, veg } = req.query;
  try {
    let query = `
      SELECT f.*, c.name AS category_name 
      FROM food_items f 
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.is_available = TRUE
    `;
    const params = [];
    if (category) { query += ' AND f.category_id = ?'; params.push(category); }
    if (search) { query += ' AND (f.name LIKE ? OR f.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (veg === 'true') { query += ' AND f.is_veg = TRUE'; }
    query += ' ORDER BY f.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/food/all (admin - includes unavailable)
const getAllFoodItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, c.name AS category_name 
      FROM food_items f 
      LEFT JOIN categories c ON f.category_id = c.id
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/food/:id
const getFoodById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT f.*, c.name AS category_name FROM food_items f LEFT JOIN categories c ON f.category_id = c.id WHERE f.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Food item not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @POST /api/food (admin)
const createFoodItem = async (req, res) => {
  const { name, description, price, category_id, is_veg } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO food_items (name, description, price, category_id, image, is_veg) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, price, category_id || null, image, is_veg === 'true' || is_veg === true]
    );
    res.status(201).json({ id: result.insertId, name, description, price, category_id, image });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @PUT /api/food/:id (admin)
const updateFoodItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, is_available, is_veg } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (price) { updates.push('price = ?'); values.push(price); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (is_available !== undefined) { updates.push('is_available = ?'); values.push(is_available); }
    if (is_veg !== undefined) { updates.push('is_veg = ?'); values.push(is_veg); }
    if (image) { updates.push('image = ?'); values.push(image); }
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    values.push(id);
    await db.query(`UPDATE food_items SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Food item updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @DELETE /api/food/:id (admin)
const deleteFoodItem = async (req, res) => {
  try {
    await db.query('DELETE FROM food_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Food item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getFoodItems, getAllFoodItems, getFoodById, createFoodItem, updateFoodItem, deleteFoodItem };
