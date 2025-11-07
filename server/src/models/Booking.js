import { getPool } from '../lib/db.js';

export class Booking {
  static async create(data, connection = null) {
    const db = connection || getPool();
    const {
      event_id,
      name,
      email,
      mobile = null,
      quantity,
      total_amount,
    } = data;

    const [result] = await db.execute(
      `INSERT INTO bookings (event_id, name, email, mobile, quantity, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [event_id, name, email, mobile, quantity, total_amount]
    );

    return await this.findById(result.insertId, connection);
  }

  static async findById(id, connection = null) {
    const db = connection || getPool();
    const [rows] = await db.query('SELECT * FROM bookings WHERE id=?', [id]);
    return rows[0] || null;
  }

  static async findByEventId(eventId) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM bookings WHERE event_id=? ORDER BY booking_date DESC', [eventId]);
    return rows;
  }

  static async findAll() {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM bookings ORDER BY booking_date DESC');
    return rows;
  }
}

