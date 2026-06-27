INSERT INTO roles (name, description) VALUES
('Guest', 'Hotel guest and public website user'),
('Receptionist', 'Front desk reservations and check-in staff'),
('Restaurant Staff', 'Restaurant menu, orders, and table staff'),
('Gym Staff', 'Gym membership and attendance staff'),
('Night Club Staff', 'Night club events and ticketing staff'),
('Accountant', 'Payments, invoices, and financial reports'),
('Manager', 'Hotel operations manager'),
('Administrator', 'System administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO room_types (name, description, base_price, capacity, amenities) VALUES
('Standard', 'Comfortable room for short stays', 85.00, 2, ARRAY['Wi-Fi','TV','Desk']),
('Deluxe', 'Larger room with city view', 130.00, 2, ARRAY['Wi-Fi','TV','Mini Bar','City View']),
('Executive', 'Premium business room', 190.00, 3, ARRAY['Wi-Fi','Workspace','Lounge Access','Coffee Machine']),
('Suite', 'Luxury suite for families and VIP guests', 320.00, 4, ARRAY['Wi-Fi','Living Room','Kitchenette','Premium View'])
ON CONFLICT (name) DO NOTHING;

INSERT INTO membership_plans (name, price, duration_days) VALUES
('Daily', 15.00, 1),
('Weekly', 60.00, 7),
('Monthly', 180.00, 30),
('Yearly', 1650.00, 365)
ON CONFLICT (name) DO NOTHING;

INSERT INTO rooms (room_type_id, room_number, floor, status)
SELECT rt.id, data.room_number, data.floor, 'Available'
FROM (VALUES
  ('Standard','101',1), ('Standard','102',1), ('Deluxe','201',2), ('Deluxe','202',2),
  ('Executive','301',3), ('Executive','302',3), ('Suite','401',4), ('Suite','402',4)
) AS data(type_name, room_number, floor)
JOIN room_types rt ON rt.name = data.type_name
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO meeting_rooms (name, capacity, hourly_rate, equipment) VALUES
('Bambis Boardroom', 18, 45.00, ARRAY['Projector','Microphone','TV Screen','Wi-Fi']),
('Addis Conference Hall', 120, 180.00, ARRAY['Projector','Microphone','Speakers','TV Screen','Wi-Fi'])
ON CONFLICT (name) DO NOTHING;

INSERT INTO menu_items (name, category, description, price) VALUES
('Vora Breakfast Platter', 'Breakfast', 'Eggs, injera, fruit, coffee', 12.00),
('Grilled Nile Perch', 'Lunch', 'Served with seasonal vegetables', 18.00),
('Chef Dinner Special', 'Dinner', 'Rotating Ethiopian and continental menu', 24.00),
('Fresh Juice', 'Drinks', 'Seasonal fruit juice', 5.00),
('Chocolate Mousse', 'Desserts', 'House dessert', 7.00);

-- Seed users
INSERT INTO users (role_id, full_name, email, password_hash, is_verified) VALUES
((SELECT id FROM roles WHERE name = 'Administrator'), 'Admin User', 'admin@voraaddis.com', '$2a$12$t3v5Kifpct.I40FINnSjsOUvPouMMATy9rN6BjFtH7ZiPCzIT3KOq', TRUE),
((SELECT id FROM roles WHERE name = 'Manager'), 'Manager User', 'manager@voraaddis.com', '$2a$12$t3v5Kifpct.I40FINnSjsOUvPouMMATy9rN6BjFtH7ZiPCzIT3KOq', TRUE),
((SELECT id FROM roles WHERE name = 'Receptionist'), 'Receptionist User', 'receptionist@voraaddis.com', '$2a$12$t3v5Kifpct.I40FINnSjsOUvPouMMATy9rN6BjFtH7ZiPCzIT3KOq', TRUE),
((SELECT id FROM roles WHERE name = 'Accountant'), 'Accountant User', 'accountant@voraaddis.com', '$2a$12$t3v5Kifpct.I40FINnSjsOUvPouMMATy9rN6BjFtH7ZiPCzIT3KOq', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Seed staff records linked to users
INSERT INTO staff (user_id, full_name, department, job_title, hire_date, salary, performance_score)
SELECT u.id, u.full_name, data.department, data.job_title, '2026-01-01'::date, data.salary, 4.50
FROM users u
JOIN (VALUES
  ('admin@voraaddis.com', 'Management', 'System Admin', 5000.00),
  ('manager@voraaddis.com', 'Management', 'Hotel Manager', 4500.00),
  ('receptionist@voraaddis.com', 'Reception', 'Reception Supervisor', 2500.00),
  ('accountant@voraaddis.com', 'Accounting', 'Senior Accountant', 3500.00)
) AS data(email, department, job_title, salary) ON u.email = data.email
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE staff.user_id = u.id);

