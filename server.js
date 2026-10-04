const express    = require('express');
const db         = require('./db');           // connects to MySQL & bootstraps schema
const usersRoute = require('./routes/users');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());                      // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse HTML-form bodies

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/users', usersRoute);

app.get('/', (req, res) => res.json({ message: '🚀 UserService is running.' }));

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(3000, () => console.log('🚀  Server running on port 3000'));

