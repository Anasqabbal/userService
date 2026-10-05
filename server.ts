import express, { Application, Request, Response } from 'express';
import db from './db';                   // connects to MySQL & bootstraps schema
import usersRoute from './routes/users';

const app: Application = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());                         // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse HTML-form bodies

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/users', usersRoute);

app.get('/', (req: Request, res: Response) =>
  res.json({ message: '🚀 UserService is running.' })
);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(3000, (): void => {
  console.log('🚀  Server running on port 3000');
});
