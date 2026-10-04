const express  = require('express');
const bcrypt   = require('bcryptjs');
const db       = require('../db');

const router = express.Router();

// ─── POST /users  ─────────────────────────────────────────────────────────────
// Body: { name, email, password }
// Creates a new user or returns an error if the email is already taken.
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  // ── 1. Validate input ──────────────────────────────────────────────────────
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'name, email, and password are required.',
    });
  }

  try {
    // ── 2. Check if user already exists ─────────────────────────────────────
    const [rows] = await db.promise().query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).json({
        success  : false,
        exists   : true,
        message  : `A user with email "${email}" already exists.`,
        user     : rows[0],   // return the existing user's public info
      });
    }

    // ── 3. Hash the password ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── 4. Insert the new user ───────────────────────────────────────────────
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      success : true,
      exists  : false,
      message : `User "${name}" created successfully.`,
      user    : {
        id   : result.insertId,
        name,
        email,
      },
    });

  } catch (err) {
    console.error('❌  Error creating user:', err.message);
    return res.status(500).json({
      success : false,
      message : 'Internal server error.',
    });
  }
});

// ─── GET /users  ──────────────────────────────────────────────────────────────
// Returns all users (public fields only — no passwords).
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );

    return res.status(200).json({
      success : true,
      count   : rows.length,
      users   : rows,
    });

  } catch (err) {
    console.error('❌  Error fetching users:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
