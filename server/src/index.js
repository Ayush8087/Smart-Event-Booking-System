import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createConnectionPool } from './lib/db.js';
import router from './routes/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', router);

app.get('/', (_req, res) => {
  res.json({ name: 'Smart Event Booking API', status: 'ok' });
});

const port = process.env.PORT || 4000;

async function start() {
  await createConnectionPool();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});


