"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("../services/userService");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// ─── POST /users ──────────────────────────────────────────────────────────────
// Body (JSON): { name, lastname, username, email, password }
router.post('/', async (req, res) => {
    try {
        const result = await (0, userService_1.createUser)(req.body);
        if (!result.success && !result.exists) {
            res.status(400).json(result); // validation error
            return;
        }
        if (result.exists) {
            res.status(409).json(result); // duplicate email
            return;
        }
        res.status(201).json(result); // created
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌  Error in POST /users:', message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
// ─── GET /users ───────────────────────────────────────────────────────────────
// Returns all users (no passwords).
router.get('/', async (_req, res) => {
    try {
        const [rows] = await db_1.default.query('SELECT id, name, lastname, username, email, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json({ success: true, count: rows.length, users: rows });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌  Error in GET /users:', message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
exports.default = router;
