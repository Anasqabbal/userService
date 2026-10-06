"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = initDB;
const promise_1 = __importDefault(require("mysql2/promise"));
// ─── Connection Pool ──────────────────────────────────────────────────────────
// A pool handles concurrent requests safely; a single connection does not.
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'apppassword',
    database: process.env.DB_NAME || 'userservicedb',
    waitForConnections: true,
    connectionLimit: 10, // max simultaneous connections
    queueLimit: 0, // unlimited queue
});
// ─── Bootstrap Schema ─────────────────────────────────────────────────────────
// Called once at startup from server.ts before the HTTP server is opened.
async function initDB() {
    const CREATE_USERS_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
      id         INT          AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      lastname   VARCHAR(100) NOT NULL,
      username   VARCHAR(100) NOT NULL UNIQUE,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `;
    // Grab one connection just to verify connectivity + run DDL
    const connection = await pool.getConnection();
    try {
        console.log('✅  Connected to MySQL pool!');
        console.log(`    Host     : ${process.env.DB_HOST || 'localhost'}`);
        console.log(`    Database : ${process.env.DB_NAME || 'userservicedb'}`);
        await connection.query(CREATE_USERS_TABLE);
        console.log('📋  users table ready.');
    }
    finally {
        connection.release(); // always return the connection to the pool
    }
}
exports.default = pool;
