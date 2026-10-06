"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db"));
// ── Service ───────────────────────────────────────────────────────────────────
/**
 * Creates a new user in the database.
 *
 * @param userData - The user data containing name, lastname, username, email, and password.
 * @returns A result object indicating success or failure, with an optional user record.
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
    // ── 2. Check if a user with this email already exists ─────────────────────
    const [rows] = await db_1.default.query('SELECT id, name, lastname, username, email, created_at FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
        return {
            success: false,
            exists: true,
            message: `A user with email "${email}" already exists.`,
            user: rows[0],
        };
    }
    // ── 3. Hash the password before storing ────────────────────────────────────
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // ── 4. Insert the new user ─────────────────────────────────────────────────
    const [result] = await db_1.default.query('INSERT INTO users (name, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)', [name, lastname, username, email, hashedPassword]);
    return {
        success: true,
        exists: false,
        message: `User "${name}" created successfully.`,
        user: {
            id: result.insertId,
            name,
            lastname,
            username,
            email,
        },
    };
}
