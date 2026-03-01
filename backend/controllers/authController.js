const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please provide name, email and password' });
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, address || null]
    );
    const token = generateToken(result.insertId);
    res.status(201).json({ token, user: { id: result.insertId, name, email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Please provide email and password' });
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  try {
    await db.query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [
      name,
      phone,
      address,
      req.user.id,
    ]);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
