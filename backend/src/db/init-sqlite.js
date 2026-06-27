/**
 * init-sqlite.js
 * Initialise the Vora Addis HMS SQLite database from schema.sql and seed
 * staff/lookup data. Run once with:  node src/db/init-sqlite.js
 *
 * The seed.sql uses PostgreSQL-only syntax (ARRAY[...], subselects with $1, etc.)
 * so we seed programmatically here using the DatabaseSync API instead.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath  = path.resolve(__dirname, '../../vora_addis_hms.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

// ── 1. Open / create the database ────────────────────────────────────────────
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// ── 2. Apply schema ───────────────────────────────────────────────────────────
const schema = fs.readFileSync(schemaPath, 'utf8');
// SQLite does not understand the first line "PRAGMA foreign_keys = ON;" from
// the schema file when run via exec on a fresh DB – it is safe to re-run it.
db.exec(schema);
console.log('✔  Schema applied');

// ── 3. Helper – insert only if not already present ───────────────────────────
function insertOrIgnore(sql, params) {
  try {
    db.prepare(sql).run(...params);
  } catch (e) {
    if (!e.message.includes('UNIQUE constraint')) throw e;
  }
}

// ── 4. Roles ──────────────────────────────────────────────────────────────────
const roles = [
  ['Guest',           'Hotel guest and public website user'],
  ['Receptionist',    'Front desk reservations and check-in staff'],
  ['Restaurant Staff','Restaurant menu, orders, and table staff'],
  ['Gym Staff',       'Gym membership and attendance staff'],
  ['Night Club Staff','Night club events and ticketing staff'],
  ['Accountant',      'Payments, invoices, and financial reports'],
  ['Manager',         'Hotel operations manager'],
  ['Administrator',   'System administrator'],
];
for (const [name, description] of roles) {
  insertOrIgnore(
    `INSERT INTO roles (name, description) VALUES (?, ?)`,
    [name, description]
  );
}
console.log('✔  Roles seeded');

// ── 5. Room types ─────────────────────────────────────────────────────────────
const roomTypes = [
  ['Single',    'Compact room for solo travelers',            60.00,  1, 'Wi-Fi,TV,Desk'],
  ['Twin',      'Room with two separate single beds',         75.00,  2, 'Wi-Fi,TV,Desk,2 Beds'],
  ['Standard',  'Comfortable room for short stays',           85.00,  2, 'Wi-Fi,TV,Desk'],
  ['Deluxe',    'Larger room with city view',                130.00,  2, 'Wi-Fi,TV,Mini Bar,City View'],
  ['Executive', 'Premium business room',                     190.00,  3, 'Wi-Fi,Workspace,Lounge Access,Coffee Machine'],
  ['Suite',     'Luxury suite for families and VIP guests',  320.00,  4, 'Wi-Fi,Living Room,Kitchenette,Premium View'],
];
for (const [name, description, base_price, capacity, amenities] of roomTypes) {
  insertOrIgnore(
    `INSERT INTO room_types (name, description, base_price, capacity, amenities) VALUES (?, ?, ?, ?, ?)`,
    [name, description, base_price, capacity, amenities]
  );
}
console.log('✔  Room types seeded');

// ── 6. Rooms ──────────────────────────────────────────────────────────────────
const roomData = [
  ['Single',   '103', 1], ['Single',   '104', 1],
  ['Twin',     '105', 1], ['Twin',     '106', 1],
  ['Standard', '101', 1], ['Standard', '102', 1],
  ['Deluxe',   '201', 2], ['Deluxe',   '202', 2],
  ['Executive','301', 3], ['Executive','302', 3],
  ['Suite',    '401', 4], ['Suite',    '402', 4],
];
const rtStmt = db.prepare(`SELECT id FROM room_types WHERE name = ?`);
for (const [typeName, roomNumber, floor] of roomData) {
  const rt = rtStmt.get(typeName);
  if (!rt) continue;
  insertOrIgnore(
    `INSERT INTO rooms (room_type_id, room_number, floor, status) VALUES (?, ?, ?, 'Available')`,
    [rt.id, roomNumber, floor]
  );
}
console.log('✔  Rooms seeded');

// ── 7. Membership plans ───────────────────────────────────────────────────────
const plans = [
  ['Daily',   15.00,    1],
  ['Weekly',  60.00,    7],
  ['Monthly', 180.00,  30],
  ['Yearly',  1650.00, 365],
];
for (const [name, price, duration_days] of plans) {
  insertOrIgnore(
    `INSERT INTO membership_plans (name, price, duration_days) VALUES (?, ?, ?)`,
    [name, price, duration_days]
  );
}
console.log('✔  Membership plans seeded');

// ── 8. Meeting rooms ──────────────────────────────────────────────────────────
const meetingRooms = [
  ['Bambis Boardroom',       18,  45.00,  'Projector,Microphone,TV Screen,Wi-Fi'],
  ['Addis Conference Hall', 120, 180.00,  'Projector,Microphone,Speakers,TV Screen,Wi-Fi'],
];
for (const [name, capacity, hourly_rate, equipment] of meetingRooms) {
  insertOrIgnore(
    `INSERT INTO meeting_rooms (name, capacity, hourly_rate, equipment) VALUES (?, ?, ?, ?)`,
    [name, capacity, hourly_rate, equipment]
  );
}
console.log('✔  Meeting rooms seeded');

// ── 9. Menu items ─────────────────────────────────────────────────────────────
const menuItems = [
  ['Vora Breakfast Platter', 'Breakfast', 'Eggs, injera, fruit, coffee',              12.00],
  ['Grilled Nile Perch',     'Lunch',     'Served with seasonal vegetables',           18.00],
  ['Chef Dinner Special',    'Dinner',    'Rotating Ethiopian and continental menu',   24.00],
  ['Fresh Juice',            'Drinks',    'Seasonal fruit juice',                       5.00],
  ['Chocolate Mousse',       'Desserts',  'House dessert',                              7.00],
];
for (const [name, category, description, price] of menuItems) {
  // allow duplicates to be skipped gracefully (no UNIQUE on menu_items.name)
  const exists = db.prepare(`SELECT 1 FROM menu_items WHERE name = ?`).get(name);
  if (!exists) {
    db.prepare(
      `INSERT INTO menu_items (name, category, description, price) VALUES (?, ?, ?, ?)`
    ).run(name, category, description, price);
  }
}
console.log('✔  Menu items seeded');

// ── 10. Staff users ───────────────────────────────────────────────────────────
// Default password for ALL staff accounts: Vora@2026
// Changing this in production is strongly recommended.
const DEFAULT_PASSWORD = 'Vora@2026';
const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 12);

const staffUsers = [
  { roleName: 'Administrator', fullName: 'Admin User',        email: 'admin@voraaddis.com',        department: 'Management', jobTitle: 'System Admin',          salary: 5000.00 },
  { roleName: 'Manager',       fullName: 'Manager User',      email: 'manager@voraaddis.com',      department: 'Management', jobTitle: 'Hotel Manager',         salary: 4500.00 },
  { roleName: 'Receptionist',  fullName: 'Receptionist User', email: 'receptionist@voraaddis.com', department: 'Reception',  jobTitle: 'Reception Supervisor',  salary: 2500.00 },
  { roleName: 'Accountant',    fullName: 'Accountant User',   email: 'accountant@voraaddis.com',   department: 'Accounting', jobTitle: 'Senior Accountant',     salary: 3500.00 },
];

const roleStmt   = db.prepare(`SELECT id FROM roles WHERE name = ?`);
const userExists = db.prepare(`SELECT id FROM users WHERE email = ?`);
const insertUser = db.prepare(
  `INSERT INTO users (role_id, full_name, email, password_hash, is_verified)
   VALUES (?, ?, ?, ?, 1)`
);
const updateUserPwd = db.prepare(
  `UPDATE users SET password_hash = ?, is_verified = 1 WHERE email = ?`
);
const staffExists = db.prepare(`SELECT 1 FROM staff WHERE user_id = ?`);
const insertStaff = db.prepare(
  `INSERT INTO staff (user_id, full_name, department, job_title, hire_date, salary, performance_score)
   VALUES (?, ?, ?, ?, '2026-01-01', ?, 4.50)`
);

for (const u of staffUsers) {
  const role = roleStmt.get(u.roleName);
  if (!role) { console.warn(`  ⚠  Role "${u.roleName}" not found, skipping ${u.email}`); continue; }

  let userId;
  const existing = userExists.get(u.email);
  if (existing) {
    // Reset password so staff can log in with the known default
    updateUserPwd.run(passwordHash, u.email);
    userId = existing.id;
    console.log(`  ↺  Reset password for ${u.email}`);
  } else {
    insertUser.run(role.id, u.fullName, u.email, passwordHash);
    userId = userExists.get(u.email).id;
    console.log(`  +  Created ${u.email}`);
  }

  if (!staffExists.get(userId)) {
    insertStaff.run(userId, u.fullName, u.department, u.jobTitle, u.salary);
  }
}
console.log('✔  Staff users seeded');

db.close();
console.log('\n🎉  Database initialised successfully.');
console.log('    Staff login password: Vora@2026');
console.log('    Accounts: admin@voraaddis.com  manager@voraaddis.com');
console.log('              receptionist@voraaddis.com  accountant@voraaddis.com\n');
