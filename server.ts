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
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, (): void => {
  console.log(`🚀  Server running on port ${PORT}`);
});
