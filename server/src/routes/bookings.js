import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../lib/db.js';
import { Event } from '../models/Event.js';
import { Booking } from '../models/Booking.js';

const router = Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
}

// POST /api/bookings – create a booking and decrement seats atomically
router.post(
  '/',
  [
    body('event_id').isInt({ min: 1 }).toInt(),
    body('name').isString().isLength({ min: 2 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('mobile').optional().isString().trim(),
    body('quantity').isInt({ min: 1 }).toInt(),
  ],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    const { event_id, name, email, mobile = null, quantity } = req.body;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      // Lock event row for update
      const event = await Event.findByIdForUpdate(event_id, conn);
      if (!event) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: 'event_not_found' });
      }

      if (event.available_seats < quantity) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: 'insufficient_seats', available: event.available_seats });
      }

      const total_amount = Number(event.price) * quantity;
      
      // Decrement seats (using transaction connection)
      await Event.decrementSeats(event_id, quantity, conn);
      
      // Create booking
      const booking = await Booking.create(
        { event_id, name, email, mobile, quantity, total_amount },
        conn
      );

      await conn.commit();
      conn.release();
      return res.status(201).json({ booking });
    } catch (err) {
      try { await conn.rollback(); } catch {}
      conn.release();
      return res.status(500).json({ error: 'db_error', message: err.message });
    }
  }
);

export default router;


