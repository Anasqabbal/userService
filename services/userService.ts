import bcrypt from 'bcryptjs';
import db from '../db';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CreateUserInput {
  name     : string;
  lastname : string;
  username : string;
  email    : string;
  password : string;
}

interface UserRecord {
  id         : number;
  name       : string;
  lastname   : string;
  username   : string;
  email      : string;
  created_at?: string;
}

interface CreateUserResult {
  success : boolean;
  exists  : boolean;
  message : string;
  user?   : UserRecord;
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Creates a new user in the database.
 *
 * @param userData - The user data containing name, lastname, username, email, and password.
 * @returns A result object indicating success or failure, with an optional user record.
 */
async function createUser(userData: CreateUserInput): Promise<CreateUserResult> {
  const { name, lastname, username, email, password } = userData;

  // ── 1. Validate required fields ────────────────────────────────────────────
  if (!name || !lastname || !username || !email || !password) {
    return {
      success : false,
      exists  : false,
      message : 'name, lastname, username, email, and password are required.',
    };
  }

  // ── 2. Check if a user with this email already exists ─────────────────────
  const [rows] = await (db as any).promise().query<UserRecord[]>(
    'SELECT id, name, lastname, username, email, created_at FROM users WHERE email = ?',
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
  const hashedPassword: string = await bcrypt.hash(password, 10);

  // ── 4. Insert the new user ─────────────────────────────────────────────────
  const [result] = await (db as any).promise().query<{ insertId: number }>(
    'INSERT INTO users (name, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)',
    [name, lastname, username, email, hashedPassword]
  );

  return {
    success : true,
    exists  : false,
    message : `User "${name}" created successfully.`,
    user    : {
      id       : result.insertId,
      name,
      lastname,
      username,
      email,
    },
  };
}

export { createUser };
