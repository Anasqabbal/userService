import { Router, Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { createUser } from '../services/userService';
import pool from '../db';

const router = Router();

// ─── POST /users ──────────────────────────────────────────────────────────────
// Body (JSON): { name, lastname, username, email, password }
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createUser(req.body);

    if (!result.success && !result.exists) {
      res.status(400).json(result);   // validation error
      return;
    }

    if (result.exists) {
      res.status(409).json(result);   // duplicate email
      return;
    }

    res.status(201).json(result);     // created
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌  Error in POST /users:', message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /users ───────────────────────────────────────────────────────────────
// Returns all users (no passwords).
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, lastname, username, email, created_at FROM users ORDER BY created_at DESC'
    );

    res.status(200).json({ success: true, count: rows.length, users: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌  Error in GET /users:', message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
