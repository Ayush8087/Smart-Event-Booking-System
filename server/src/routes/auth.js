import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../lib/db.js';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/login
router.post(
  '/login',
  [
    body('username').isString().trim().notEmpty(),
    body('password').isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, username, role: 'admin' });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  }
);

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

