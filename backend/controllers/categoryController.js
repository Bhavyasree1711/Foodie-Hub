const db = require('../config/db');

// @GET /api/categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @POST /api/categories (admin)
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  if (!name) return res.status(400).json({ message: 'Category name is required' });
  try {
    const [result] = await db.query(
      'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
      [name, description || null, image]
    );
    res.status(201).json({ id: result.insertId, name, description, image });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @PUT /api/categories/:id (admin)
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    if (image) { updates.push('image = ?'); values.push(image); }
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    values.push(id);
    await db.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @DELETE /api/categories/:id (admin)
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
