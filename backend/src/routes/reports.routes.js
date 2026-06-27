import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reportsRouter = Router();

const STAFF_ROLES = ['Administrator', 'Manager', 'Accountant', 'Receptionist'];

reportsRouter.use(authenticate, authorize(...STAFF_ROLES));

reportsRouter.get('/dashboard', asyncHandler(async (_req, res) => {
  const [
    occupancy,
    revenue,
    moduleRevenue,
    bookingTrend,
    customerStats,
    roomStatus,
    todayActivity
  ] = await Promise.all([
    // Occupancy rate
    query(`
      SELECT ROUND(
        100.0 * SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END)
        / CAST(MAX(COUNT(*), 1) AS REAL), 1
      ) AS occupancy_rate
      FROM rooms
    `),
    // Revenue
    query(`
      SELECT
        COALESCE(SUM(CASE WHEN date(paid_at) = date('now') THEN amount ELSE 0 END), 0) AS daily_revenue,
        COALESCE(SUM(CASE WHEN paid_at >= strftime('%Y-%m-01', 'now') THEN amount ELSE 0 END), 0) AS monthly_revenue,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) AS pending_revenue
      FROM payments
      WHERE status IN ('Completed', 'Pending')
    `),
    // Revenue by module
    query(`
      SELECT module, COALESCE(SUM(amount), 0) AS revenue
      FROM payments WHERE status = 'Completed'
      GROUP BY module ORDER BY revenue DESC
    `),
    // Booking trend last 14 days
    query(`
      SELECT date(created_at) AS day, COUNT(*) AS bookings
      FROM reservations
      WHERE created_at >= datetime('now', '-14 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `),
    // Customer stats
    query(`
      SELECT
        COUNT(*) AS total_customers,
        SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS new_customers
      FROM customers
    `),
    // Room status breakdown
    query(`
      SELECT status, COUNT(*) AS count FROM rooms GROUP BY status
    `),
    // Today's arrivals and departures
    query(`
      SELECT
        SUM(CASE WHEN check_in_date = date('now')  AND status IN ('Confirmed','Pending') THEN 1 ELSE 0 END) AS arrivals_today,
        SUM(CASE WHEN check_out_date = date('now') AND status = 'CheckedIn'              THEN 1 ELSE 0 END) AS departures_today,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) AS upcoming,
        COUNT(*) AS total
      FROM reservations
    `)
  ]);

  // Flatten room status into an object
  const roomStatusMap = {};
  for (const row of roomStatus.rows) roomStatusMap[row.status] = Number(row.count);

  res.json({
    occupancyRate:    Number(occupancy.rows[0]?.occupancy_rate   || 0),
    dailyRevenue:     Number(revenue.rows[0]?.daily_revenue       || 0),
    monthlyRevenue:   Number(revenue.rows[0]?.monthly_revenue     || 0),
    pendingRevenue:   Number(revenue.rows[0]?.pending_revenue     || 0),
    moduleRevenue:    moduleRevenue.rows,
    bookingTrend:     bookingTrend.rows,
    customerStats:    customerStats.rows[0],
    roomStatus:       roomStatusMap,
    todayActivity:    todayActivity.rows[0],
  });
}));
