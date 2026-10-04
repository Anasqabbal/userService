const bcrypt = require('bcryptjs');
const db     = require('../db');

/**
 * Creates a new user in the database.
 *
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<{ success: boolean, exists: boolean, message: string, user?: object }>}
 */
async function createUser({ name, email, password }) {

  // ── 1. Validate required fields ────────────────────────────────────────────
  if (!name || !email || !password) {
    return {
      success : false,
      exists  : false,
      message : 'name, email, and password are required.',
    };
  }

  // ── 2. Check if a user with this email already exists ─────────────────────
  const [rows] = await db.promise().query(
    'SELECT id, name, email, created_at FROM users WHERE email = ?',
    [email]
  );

  if (rows.length > 0) {
    return {
      success : false,
      exists  : true,
      message : `A user with email "${email}" already exists.`,
      user    : rows[0],      // return the existing user's public info
    };
  }

  // ── 3. Hash the password before storing ────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 10);

  // ── 4. Insert the new user ─────────────────────────────────────────────────
  const [result] = await db.promise().query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  return {
    success : true,
    exists  : false,
    message : `User "${name}" created successfully.`,
    user    : {
      id        : result.insertId,
      name,
      email,
    },
  };
}

module.exports = { createUser };
