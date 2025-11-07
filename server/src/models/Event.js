import { getPool } from '../lib/db.js';

export class Event {
  static async findAll(filters = {}) {
    const pool = getPool();
    const { location, date, q } = filters;
    const conditions = [];
    const params = [];

    if (location) {
      conditions.push('location LIKE ?');
      params.push(`%${location}%`);
    }
    if (date) {
      conditions.push('DATE(date) = DATE(?)');
      params.push(new Date(date));
    }
    if (q) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM events ${where} ORDER BY date ASC`;
    
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('SQL Error in Event.findAll:', {
        sql,
        params,
        error: err.message,
        code: err.code,
        sqlState: err.sqlState
      });
      throw err;
    }
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM events WHERE id=?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const pool = getPool();
    const {
      title,
      description = null,
      location,
      date,
      total_seats,
      available_seats,
      price,
      img = null,
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, location, new Date(date), total_seats, available_seats, price, img]
    );

    return await this.findById(result.insertId);
  }

  static async update(id, data) {
    const pool = getPool();
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${key} = ?`);
      params.push(key === 'date' ? new Date(value) : value);
    }

    if (!fields.length) {
      throw new Error('No fields to update');
    }

    params.push(id);
    const [result] = await pool.execute(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('DELETE FROM bookings WHERE event_id=?', [id]);
      const [result] = await connection.execute('DELETE FROM events WHERE id=?', [id]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async decrementSeats(id, quantity, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      'UPDATE events SET available_seats = available_seats - ? WHERE id=?',
      [quantity, id]
    );
    return result.affectedRows > 0;
  }

  static async findByIdForUpdate(id, connection) {
    const [rows] = await connection.query('SELECT * FROM events WHERE id=? FOR UPDATE', [id]);
    return rows[0] || null;
  }
}

