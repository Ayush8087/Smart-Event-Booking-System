import { Router } from 'express';
import { getPool } from '../lib/db.js';
import eventsRouter from './events.js';
import bookingsRouter from './bookings.js';
import authRouter from './auth.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT 1 as ok');
    
    // Check if events table exists
    let tableExists = false;
    try {
      const [tables] = await pool.query("SHOW TABLES LIKE 'events'");
      tableExists = tables.length > 0;
    } catch (e) {
      console.error('Error checking tables:', e.message);
    }
    
    res.json({ 
      status: 'ok', 
      db: rows[0].ok === 1,
      tables: {
        events: tableExists
      }
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      code: err.code,
      sqlState: err.sqlState
    });
  }
});

router.use('/auth', authRouter);
router.use('/events', eventsRouter);
router.use('/bookings', bookingsRouter);

export default router;


