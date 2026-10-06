"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db"));
// ── Helpers ───────────────────────────────────────────────────────────────────
/** Returns the user row (without password) or null. */
async function findUserById(id) {
    const [rows] = await db_1.default.query('SELECT id, name, lastname, username, email, created_at FROM users WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
}
// ── createUser ────────────────────────────────────────────────────────────────
/**
 * Creates a new user in the database.
 * Checks for duplicate email AND duplicate username before inserting.
 */
async function createUser(userData) {
    const { name, lastname, username, email, password } = userData;
    // ── 1. Validate required fields ────────────────────────────────────────────
    if (!name || !lastname || !username || !email || !password) {
        return {
            success: false,
            exists: false,
            message: 'name, lastname, username, email, and password are required.',
        };
    }
    // ── 2. Check duplicate email ───────────────────────────────────────────────
    const [emailRows] = await db_1.default.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailRows.length > 0) {
        return {
            success: false,
            exists: true,
            message: `A user with email "${email}" already exists.`,
        };
    }
    // ── 3. Check duplicate username ────────────────────────────────────────────
    const [usernameRows] = await db_1.default.query('SELECT id FROM users WHERE username = ?', [username]);
    if (usernameRows.length > 0) {
        return {
            success: false,
            exists: true,
            message: `Username "${username}" is already taken.`,
        };
    }
    // ── 4. Hash password ───────────────────────────────────────────────────────
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // ── 5. Insert ──────────────────────────────────────────────────────────────
    const [result] = await db_1.default.query('INSERT INTO users (name, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)', [name, lastname, username, email, hashedPassword]);
    return {
        success: true,
        exists: false,
        message: `User "${name}" created successfully.`,
        data: { id: result.insertId, name, lastname, username, email },
    };
}
// ── getAllUsers ────────────────────────────────────────────────────────────────
/** Returns every user (passwords excluded). */
async function getAllUsers() {
    const [rows] = await db_1.default.query('SELECT id, name, lastname, username, email, created_at FROM users ORDER BY created_at DESC');
    return {
        success: true,
        message: `${rows.length} user(s) found.`,
        data: rows,
    };
}
// ── getUserById ───────────────────────────────────────────────────────────────
/** Returns a single user by ID (password excluded). */
async function getUserById(id) {
    const user = await findUserById(id);
    if (!user) {
        return { success: false, found: false, message: `User with id ${id} not found.` };
    }
    return { success: true, found: true, message: 'User found.', data: user };
}
// ── updateUser ────────────────────────────────────────────────────────────────
/**
 * Partially updates a user's profile fields (name, lastname, username, email).
 * Checks for duplicate email / username conflicts before applying changes.
 */
async function updateUser(id, fields) {
    // ── 1. Confirm user exists ─────────────────────────────────────────────────
    const existing = await findUserById(id);
    if (!existing) {
        return { success: false, found: false, message: `User with id ${id} not found.` };
    }
    const { name, lastname, username, email } = fields;
    // ── 2. Check no fields provided ────────────────────────────────────────────
    if (!name && !lastname && !username && !email) {
        return {
            success: false,
            found: true,
            message: 'Provide at least one field to update: name, lastname, username, or email.',
        };
    }
    // ── 3. Conflict checks (skip if value hasn't changed) ─────────────────────
    if (email && email !== existing.email) {
        const [emailRows] = await db_1.default.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
        if (emailRows.length > 0) {
            return { success: false, found: true, exists: true, message: `Email "${email}" is already in use.` };
        }
    }
    if (username && username !== existing.username) {
        const [usernameRows] = await db_1.default.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
        if (usernameRows.length > 0) {
            return { success: false, found: true, exists: true, message: `Username "${username}" is already taken.` };
        }
    }
    // ── 4. Build dynamic UPDATE ────────────────────────────────────────────────
    const setClauses = [];
    const values = [];
    if (name) {
        setClauses.push('name = ?');
        values.push(name);
    }
    if (lastname) {
        setClauses.push('lastname = ?');
        values.push(lastname);
    }
    if (username) {
        setClauses.push('username = ?');
        values.push(username);
    }
    if (email) {
        setClauses.push('email = ?');
        values.push(email);
    }
    values.push(id);
    await db_1.default.query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`, values);
    // ── 5. Return updated record ───────────────────────────────────────────────
    const updated = await findUserById(id);
    return { success: true, found: true, message: 'User updated successfully.', data: updated };
}
// ── deleteUser ────────────────────────────────────────────────────────────────
/** Deletes a user by ID. Returns found: false if the user doesn't exist. */
async function deleteUser(id) {
    const existing = await findUserById(id);
    if (!existing) {
        return { success: false, found: false, message: `User with id ${id} not found.` };
    }
    await db_1.default.query('DELETE FROM users WHERE id = ?', [id]);
    return { success: true, found: true, message: `User with id ${id} deleted successfully.` };
}
