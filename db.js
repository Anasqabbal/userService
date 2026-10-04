const mysql = require('mysql2');

// ─── Create Connection ────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host    : process.env.DB_HOST     || 'localhost',
  port    : process.env.DB_PORT     || 3306,
  user    : process.env.DB_USER     || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME     || 'userservicedb',
});

// ─── Connect & Bootstrap Schema ──────────────────────────────────────────────
db.connect((err) => {
  if (err) {
    console.error('❌  MySQL connection FAILED:', err.message);
    process.exit(1);            // no point running without a DB
  }

  console.log('✅  Connected to MySQL!');
  console.log(`    Host     : ${process.env.DB_HOST || 'localhost'}`);
  console.log(`    Database : ${process.env.DB_NAME || 'userservicedb'}`);

  // Auto-create the users table if it doesn't exist yet
  const CREATE_USERS_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
      id         INT          AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(CREATE_USERS_TABLE, (err) => {
    if (err) {
      console.error('❌  Failed to create users table:', err.message);
      process.exit(1);
    }
    console.log('📋  users table ready.');
  });
});

module.exports = db;
