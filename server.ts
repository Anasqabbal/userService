import 'dotenv/config';                  // load .env before anything else
import express, { Application, Request, Response } from 'express';
import { initDB } from './db';
import usersRoute from './routes/users';

const app: Application = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());                         // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse HTML-form bodies

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/users', usersRoute);

app.get('/', (_req: Request, res: Response) =>
  res.json({ message: '🚀 UserService is running.' })
);

// ─── Bootstrap & Start ───────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  await initDB();                         // connect + create schema
  app.listen(PORT, () => {
    console.log(`🚀  Server running on port ${PORT}`);
  });
}

bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('❌  Failed to start server:', message);
  process.exit(1);
});
