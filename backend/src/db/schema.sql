PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  role_id TEXT NOT NULL REFERENCES roles(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT COLLATE NOCASE,
  phone TEXT,
  nationality TEXT,
  id_document_type TEXT,
  id_document_number TEXT,
  address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS room_types (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('Single', 'Twin', 'Standard', 'Deluxe', 'Executive', 'Suite')),
  description TEXT,
  base_price NUMERIC NOT NULL CHECK (base_price >= 0),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  amenities TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  room_type_id TEXT NOT NULL REFERENCES room_types(id),
  room_number TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL CHECK (floor >= 0),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Cleaning', 'Maintenance')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  room_id TEXT NOT NULL REFERENCES rooms(id),
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Pending', 'Confirmed', 'Modified', 'Cancelled', 'CheckedIn', 'CheckedOut')),
  total_cost NUMERIC NOT NULL CHECK (total_cost >= 0),
  payment_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid', 'Refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (check_out_date > check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_room_status ON reservations(room_id, status);

CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  reservation_id TEXT NOT NULL UNIQUE REFERENCES reservations(id),
  checked_in_by TEXT REFERENCES users(id),
  actual_check_in TEXT NOT NULL DEFAULT (datetime('now')),
  assigned_room_id TEXT NOT NULL REFERENCES rooms(id),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS check_outs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  check_in_id TEXT NOT NULL UNIQUE REFERENCES check_ins(id),
  checked_out_by TEXT REFERENCES users(id),
  actual_check_out TEXT NOT NULL DEFAULT (datetime('now')),
  room_condition TEXT,
  extra_charges NUMERIC NOT NULL DEFAULT 0 CHECK (extra_charges >= 0)
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  reservation_id TEXT REFERENCES reservations(id),
  invoice_number TEXT NOT NULL UNIQUE,
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  tax NUMERIC NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Paid', 'Void')),
  issued_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  customer_id TEXT REFERENCES customers(id),
  invoice_id TEXT REFERENCES invoices(id),
  module TEXT NOT NULL CHECK (module IN ('Rooms', 'Restaurant', 'Gym', 'Night Club', 'Meeting Rooms')),
  method TEXT NOT NULL CHECK (method IN ('Cash', 'Bank Transfer', 'Mobile Payment')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
  paid_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_module_paid_at ON payments(module, paid_at);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts')),
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  is_available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS restaurant_orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  customer_id TEXT REFERENCES customers(id),
  table_number TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Preparing', 'Served', 'Paid', 'Cancelled')),
  total NUMERIC NOT NULL DEFAULT 0 CHECK (total >= 0),
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS restaurant_order_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  order_id TEXT NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE IF NOT EXISTS table_reservations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  table_number TEXT NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  reservation_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Reserved' CHECK (status IN ('Reserved', 'Seated', 'Cancelled', 'Completed'))
);

CREATE TABLE IF NOT EXISTS membership_plans (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('Daily', 'Weekly', 'Monthly', 'Yearly')),
  price NUMERIC NOT NULL CHECK (price >= 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0)
);

CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  full_name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS gym_members (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  membership_plan_id TEXT NOT NULL REFERENCES membership_plans(id),
  trainer_id TEXT REFERENCES trainers(id),
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')),
  CHECK (ends_on >= starts_on)
);

CREATE TABLE IF NOT EXISTS gym_attendance (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  gym_member_id TEXT NOT NULL REFERENCES gym_members(id),
  attended_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS night_club_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Live', 'Completed', 'Cancelled')),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  event_id TEXT NOT NULL REFERENCES night_club_events(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id),
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('Regular', 'VIP', 'Premium')),
  price NUMERIC NOT NULL CHECK (price >= 0),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold', 'Used', 'Cancelled')),
  purchased_at TEXT
);

CREATE TABLE IF NOT EXISTS vip_reservations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  event_id TEXT NOT NULL REFERENCES night_club_events(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  guests_count INTEGER NOT NULL CHECK (guests_count > 0),
  status TEXT NOT NULL DEFAULT 'Reserved' CHECK (status IN ('Reserved', 'CheckedIn', 'Cancelled'))
);

CREATE TABLE IF NOT EXISTS meeting_rooms (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  hourly_rate NUMERIC NOT NULL CHECK (hourly_rate >= 0),
  equipment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS meeting_bookings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  meeting_room_id TEXT NOT NULL REFERENCES meeting_rooms(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  attendees_count INTEGER NOT NULL CHECK (attendees_count > 0),
  equipment_requested TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Booked' CHECK (status IN ('Booked', 'Completed', 'Cancelled')),
  total_cost NUMERIC NOT NULL CHECK (total_cost >= 0),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_meeting_bookings_room_dates ON meeting_bookings(meeting_room_id, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('Reception', 'Restaurant', 'Gym', 'Night Club', 'Accounting', 'Management')),
  job_title TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  salary NUMERIC CHECK (salary >= 0),
  performance_score NUMERIC CHECK (performance_score BETWEEN 0 AND 5)
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  staff_id TEXT NOT NULL REFERENCES staff(id),
  work_date TEXT NOT NULL,
  clock_in TEXT,
  clock_out TEXT,
  status TEXT NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
  UNIQUE(staff_id, work_date)
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  customer_id TEXT REFERENCES customers(id),
  module TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  actor_user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON audit_logs(actor_user_id, created_at);
