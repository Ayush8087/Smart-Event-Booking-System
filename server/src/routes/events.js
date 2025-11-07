import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Event } from '../models/Event.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

// POST /api/events – create event (admin only)
router.post(
  '/',
  requireAdmin,
  [
    body('title').isString().isLength({ min: 2 }).trim(),
    body('description').optional().isString(),
    body('location').isString().isLength({ min: 2 }).trim(),
    body('date').isISO8601().toDate(),
    body('total_seats').isInt({ min: 1 }).toInt(),
    body('available_seats').isInt({ min: 0 }).toInt(),
    body('price').isFloat({ min: 0 }).toFloat(),
    body('img').optional().isString(),
  ],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    try {
      const event = await Event.create(req.body);
      res.status(201).json(event);
    } catch (err) {
      res.status(500).json({ error: 'db_error', message: err.message });
    }
  }
);

// GET /api/events – list events with optional search/filter
router.get(
  '/',
  [
    query('location').optional().isString().trim(),
    query('date').optional().isISO8601().toDate(),
    query('q').optional().isString().trim(),
  ],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    try {
      const events = await Event.findAll({
        location: req.query.location,
        date: req.query.date,
        q: req.query.q,
      });
      res.json(events);
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ 
        error: 'db_error', 
        message: err.message,
        code: err.code,
        sqlState: err.sqlState
      });
    }
  }
);

// GET /api/events/:id – details
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'not_found' });
      res.json(event);
    } catch (err) {
      res.status(500).json({ error: 'db_error', message: err.message });
    }
  }
);

// PUT /api/events/:id – update (admin only)
router.put(
  '/:id',
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('title').optional().isString().isLength({ min: 2 }).trim(),
    body('description').optional().isString(),
    body('location').optional().isString().isLength({ min: 2 }).trim(),
    body('date').optional().isISO8601().toDate(),
    body('total_seats').optional().isInt({ min: 1 }).toInt(),
    body('available_seats').optional().isInt({ min: 0 }).toInt(),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('img').optional().isString(),
  ],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    try {
      const event = await Event.update(req.params.id, req.body);
      if (!event) return res.status(404).json({ error: 'not_found' });
      res.json(event);
    } catch (err) {
      if (err.message === 'No fields to update') {
        return res.status(400).json({ error: 'no_fields' });
      }
      res.status(500).json({ error: 'db_error', message: err.message });
    }
  }
);

// DELETE /api/events/:id – delete (admin only)
router.delete(
  '/:id',
  requireAdmin,
  [param('id').isInt({ min: 1 }).toInt()],
  async (req, res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;
    try {
      const deleted = await Event.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'not_found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'db_error', message: err.message });
    }
  }
);

export default router;


