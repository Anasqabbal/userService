"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // load .env before anything else
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express_1.default.json()); // parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // parse HTML-form bodies
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/users', users_1.default);
app.get('/', (_req, res) => res.json({ message: '🚀 UserService is running.' }));
// ─── Bootstrap & Start ───────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;
async function bootstrap() {
    await (0, db_1.initDB)(); // connect + create schema
    app.listen(PORT, () => {
        console.log(`🚀  Server running on port ${PORT}`);
    });
}
bootstrap().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌  Failed to start server:', message);
    process.exit(1);
});
