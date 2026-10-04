const express     = require('express');
const { createUser } = require('../services/userService');
const db          = require('../db');

const router = express.Router();

// ─── POST /users  ─────────────────────────────────────────────────────────────
// Body (JSON or HTML form): { name, email, password }
router.post('/', async (req, res) => {
  try {
    const result = await createUser(req.body);

    if (!result.success && !result.exists) {
      return res.status(400).json(result);   // validation error
    }

    if (result.exists) {
      return res.status(409).json(result);   // duplicate email
    }

    return res.status(201).json(result);     // created
  } catch (err) {
    console.error('❌  Error in POST /users:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /users  ──────────────────────────────────────────────────────────────
// Returns all users (no passwords).
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );

    return res.status(200).json({ success: true, count: rows.length, users: rows });
  } catch (err) {
    console.error('❌  Error in GET /users:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;

