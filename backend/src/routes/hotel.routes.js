import { Router } from 'express';
import { body, query as checkQuery } from 'express-validator';
import { pool, query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const hotelRouter = Router();

hotelRouter.get('/public/rooms', asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT r.id, r.room_number, r.status, rt.name AS type, rt.description, rt.base_price, rt.capacity, rt.amenities
     FROM rooms r JOIN room_types rt ON rt.id = r.room_type_id
     ORDER BY rt.base_price, r.room_number`
  );
  res.json({ data: rows });
}));

hotelRouter.get('/public/rooms/:roomNumber/active-guest', asyncHandler(async (req, res) => {
  const { roomNumber } = req.params;
  const { rows } = await query(
    `SELECT c.full_name, r.room_number, rt.name AS type, res.check_in_date, res.check_out_date
     FROM rooms r
     JOIN room_types rt ON rt.id = r.room_type_id
     LEFT JOIN check_ins ci ON ci.assigned_room_id = r.id
     LEFT JOIN reservations res ON res.id = ci.reservation_id AND res.status = 'CheckedIn'
     LEFT JOIN customers c ON c.id = res.customer_id
     WHERE r.room_number = ?`,
    [roomNumber]
  );
  if (!rows[0]) {
    throw new HttpError(404, 'Room not found');
  }
  res.json({ data: rows[0] });
}));

// ── Availability check (SQLite-compatible date overlap) ──────────────────────
hotelRouter.get('/availability',
  checkQuery('checkIn').isISO8601(),
  checkQuery('checkOut').isISO8601(),
  validate,
  asyncHandler(async (req, res) => {
    const { checkIn, checkOut, roomType } = req.query;
    // Date overlap: existing reservation overlaps [checkIn, checkOut) when
    //   check_in_date < checkOut  AND  check_out_date > checkIn
    let sql = `
      SELECT r.id, r.room_number, r.floor, r.status,
             rt.name AS room_type, rt.base_price, rt.capacity, rt.amenities
      FROM rooms r
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE r.status = 'Available'
      AND NOT EXISTS (
        SELECT 1 FROM reservations res
        WHERE res.room_id = r.id
          AND res.status NOT IN ('Cancelled', 'CheckedOut')
          AND res.check_in_date  < ?
          AND res.check_out_date > ?
      )`;
    const params = [checkOut, checkIn];
    if (roomType) {
      sql += ` AND rt.name = ?`;
      params.push(roomType);
    }
    sql += ` ORDER BY rt.base_price, r.room_number`;
    const { rows } = await query(sql, params);
    res.json({ data: rows });
  })
);

// ── Online booking (public — no login required) ──────────────────────────────
hotelRouter.post('/bookings',
  body('customer.fullName').isLength({ min: 2 }),
  body('customer.email').optional({ checkFalsy: true }).isEmail(),
  body('roomId').notEmpty(),
  body('checkInDate').isISO8601(),
  body('checkOutDate').isISO8601(),
  validate,
  asyncHandler(async (req, res) => {
    const { customer, roomId, checkInDate, checkOutDate } = req.body;

    // Validate dates
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      throw new HttpError(400, 'Check-out date must be after check-in date');
    }

    // Use SQLite synchronous transaction via pool.db
    const db = pool.db;

    // Check for overlap first (outside transaction is fine for a read)
    const overlapStmt = db.prepare(
      `SELECT 1 FROM reservations
       WHERE room_id = ?
         AND status NOT IN ('Cancelled', 'CheckedOut')
         AND check_in_date  < ?
         AND check_out_date > ?`
    );
    const overlap = overlapStmt.get(roomId, checkOutDate, checkInDate);
    if (overlap) throw new HttpError(409, 'Room is not available for those dates');

    // Get room price
    const priceRow = db.prepare(
      `SELECT rt.base_price FROM rooms r
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE r.id = ?`
    ).get(roomId);
    if (!priceRow) throw new HttpError(404, 'Room not found');

    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000);
    const totalCost = Number(priceRow.base_price) * nights;

    // Atomic insert: customer + reservation
    db.exec('BEGIN');
    try {
      // Insert customer
      db.prepare(
        `INSERT INTO customers (full_name, email, phone, nationality)
         VALUES (?, ?, ?, ?)`
      ).run(
        customer.fullName,
        customer.email   || null,
        customer.phone   || null,
        customer.nationality || null
      );

      // Retrieve the real UUID id of the customer just inserted
      const customerRow = db.prepare(
        `SELECT id FROM customers ORDER BY rowid DESC LIMIT 1`
      ).get();

      // Insert reservation
      db.prepare(
        `INSERT INTO reservations
           (customer_id, room_id, check_in_date, check_out_date, total_cost, status)
         VALUES (?, ?, ?, ?, ?, 'Confirmed')`
      ).run(customerRow.id, roomId, checkInDate, checkOutDate, totalCost);

      const reservationRow = db.prepare(
        `SELECT r.*, c.full_name AS customer_name
         FROM reservations r
         JOIN customers c ON c.id = r.customer_id
         ORDER BY r.rowid DESC LIMIT 1`
      ).get();

      db.exec('COMMIT');
      res.status(201).json({ data: reservationRow });
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  })
);

// ── Check-in (staff only) ────────────────────────────────────────────────────
hotelRouter.post('/check-in/:reservationId',
  authenticate,
  authorize('Administrator', 'Manager', 'Receptionist'),
  asyncHandler(async (req, res) => {
    const reservation = await query('SELECT * FROM reservations WHERE id = ?', [req.params.reservationId]);
    if (!reservation.rows[0]) throw new HttpError(404, 'Reservation not found');

    const result = await query(
      `INSERT INTO check_ins (reservation_id, checked_in_by, assigned_room_id, notes)
       VALUES (?, ?, ?, ?)
       RETURNING *`,
      [req.params.reservationId, req.user.id, reservation.rows[0].room_id, req.body.notes || null]
    );
    await query(`UPDATE reservations SET status = 'CheckedIn' WHERE id = ?`, [req.params.reservationId]);
    await query(`UPDATE rooms SET status = 'Occupied' WHERE id = ?`, [reservation.rows[0].room_id]);
    res.status(201).json({ data: result.rows[0] });
  })
);

// ── Check-out (staff only) ───────────────────────────────────────────────────
hotelRouter.post('/check-out/:checkInId',
  authenticate,
  authorize('Administrator', 'Manager', 'Receptionist'),
  asyncHandler(async (req, res) => {
    const checkIn = await query('SELECT * FROM check_ins WHERE id = ?', [req.params.checkInId]);
    if (!checkIn.rows[0]) throw new HttpError(404, 'Check-in not found');

    const result = await query(
      `INSERT INTO check_outs (check_in_id, checked_out_by, room_condition, extra_charges)
       VALUES (?, ?, ?, ?)
       RETURNING *`,
      [req.params.checkInId, req.user.id, req.body.roomCondition || null, req.body.extraCharges || 0]
    );
    await query(`UPDATE reservations SET status = 'CheckedOut' WHERE id = ?`, [checkIn.rows[0].reservation_id]);
    await query(`UPDATE rooms SET status = 'Cleaning' WHERE id = ?`, [checkIn.rows[0].assigned_room_id]);
    res.status(201).json({ data: result.rows[0] });
  })
);

// ── Guest: look up own reservations by email (public) ────────────────────────
hotelRouter.get('/my-reservations',
  asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) throw new HttpError(400, 'Email query parameter is required');
    const { rows } = await query(
      `SELECT r.id, r.check_in_date, r.check_out_date, r.status,
              r.total_cost, r.payment_status, r.created_at,
              rm.room_number, rt.name AS room_type,
              c.full_name AS customer_name
       FROM reservations r
       JOIN rooms rm       ON rm.id  = r.room_id
       JOIN room_types rt  ON rt.id  = rm.room_type_id
       JOIN customers c    ON c.id   = r.customer_id
       WHERE LOWER(c.email) = LOWER(?)
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [email]
    );
    res.json({ data: rows });
  })
);

// ── Guest: cancel own reservation by email (public) ─────────────────────────
hotelRouter.post('/my-reservations/:id/cancel',
  body('email').isEmail(),
  validate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    const reservation = await query(
      `SELECT r.id, r.status, c.email
       FROM reservations r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.id = ?`,
      [id]
    );

    if (!reservation.rows[0]) {
      throw new HttpError(404, 'Reservation not found');
    }

    const resRow = reservation.rows[0];
    if (resRow.email.toLowerCase() !== email.toLowerCase()) {
      throw new HttpError(403, 'You do not have permission to cancel this reservation');
    }

    if (!['Pending', 'Confirmed'].includes(resRow.status)) {
      throw new HttpError(400, `Cannot cancel reservation in '${resRow.status}' status`);
    }

    await query(`UPDATE reservations SET status = 'Cancelled' WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Reservation cancelled successfully' });
  })
);

// ── Staff: today's arrivals + departures ─────────────────────────────────────
hotelRouter.get('/reservations/today',
  authenticate,
  authorize('Administrator', 'Manager', 'Receptionist'),
  asyncHandler(async (_req, res) => {
    const [arrivals, departures] = await Promise.all([
      query(
        `SELECT r.id, r.check_in_date, r.check_out_date, r.status, r.total_cost,
                c.full_name AS customer_name, c.phone,
                rm.room_number, rt.name AS room_type
         FROM reservations r
         JOIN customers c   ON c.id  = r.customer_id
         JOIN rooms rm      ON rm.id = r.room_id
         JOIN room_types rt ON rt.id = rm.room_type_id
         WHERE r.check_in_date = date('now')
           AND r.status IN ('Confirmed', 'Pending')
         ORDER BY r.check_in_date`
      ),
      query(
        `SELECT r.id, r.check_in_date, r.check_out_date, r.status, r.total_cost,
                c.full_name AS customer_name, c.phone,
                rm.room_number, rt.name AS room_type,
                ci.id AS check_in_id
         FROM reservations r
         JOIN customers c   ON c.id  = r.customer_id
         JOIN rooms rm      ON rm.id = r.room_id
         JOIN room_types rt ON rt.id = rm.room_type_id
         LEFT JOIN check_ins ci ON ci.reservation_id = r.id
         WHERE r.check_out_date = date('now')
           AND r.status = 'CheckedIn'
         ORDER BY r.check_out_date`
      )
    ]);
    res.json({ arrivals: arrivals.rows, departures: departures.rows });
  })
);
