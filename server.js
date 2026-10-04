const express = require('express');
const mysql   = require('mysql2');

const app = express();

// ─── MySQL Connection ────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host    : process.env.DB_HOST     || 'localhost',
  port    : process.env.DB_PORT     || 3306,
  user    : process.env.DB_USER     || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME     || 'userservicedb',
});

db.connect((err) => {
  if (err) {
    console.error('❌  MySQL connection FAILED:', err.message);
    return;
  }
  console.log('✅  Successfully connected to MySQL!');
  console.log(`    Host     : ${process.env.DB_HOST || 'localhost'}`);
  console.log(`    Database : ${process.env.DB_NAME || 'userservicedb'}`);
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Hello from Express inside Docker!'));

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(3000, () => console.log('🚀  Server running on port 3000'));
