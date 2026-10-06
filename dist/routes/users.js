"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("../services/userService");
const router = (0, express_1.Router)();
// ─── POST /users ──────────────────────────────────────────────────────────────
// Body (JSON): { name, lastname, username, email, password }
router.post('/', async (req, res) => {
    try {
        const result = await (0, userService_1.createUser)(req.body);
        if (result.exists) {
            res.status(409).json(result); // duplicate email or username
            return;
        }
        if (!result.success) {
            res.status(400).json(result); // validation error
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
        const result = await (0, userService_1.getAllUsers)();
        res.status(200).json({ ...result, count: result.data?.length ?? 0, users: result.data });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌  Error in GET /users:', message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
// ─── GET /users/:id ───────────────────────────────────────────────────────────
// Returns a single user by ID (no password).
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: 'User id must be a number.' });
            return;
        }
        const result = await (0, userService_1.getUserById)(id);
        res.status(result.found ? 200 : 404).json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌  Error in GET /users/:id:', message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
// ─── PATCH /users/:id ─────────────────────────────────────────────────────────
// Body (JSON, all optional): { name, lastname, username, email }
router.patch('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: 'User id must be a number.' });
            return;
        }
        const result = await (0, userService_1.updateUser)(id, req.body);
        if (!result.found) {
            res.status(404).json(result);
            return;
        }
        if (result.exists) {
            res.status(409).json(result);
            return;
        }
        if (!result.success) {
            res.status(400).json(result);
            return;
        }
        res.status(200).json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌  Error in PATCH /users/:id:', message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
// ─── DELETE /users/:id ────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: 'User id must be a number.' });
            return;
        }
        const result = await (0, userService_1.deleteUser)(id);
        res.status(result.found ? 200 : 404).json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌  Error in DELETE /users/:id:', message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
exports.default = router;
