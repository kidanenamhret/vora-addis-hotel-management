# API Documentation

Base URL: `/api`

All protected endpoints require `Authorization: Bearer <jwt>`.

## Running API Examples

Start the backend first, either with Docker:

```bash
cd outputs/vora-addis-hms
docker compose up --build
```

Or locally:

```bash
cd outputs/vora-addis-hms/backend
npm install
npm run dev
```

Confirm the API is alive:

```bash
curl http://localhost:5000/health
```

Register a guest account:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Guest","email":"guest@example.com","password":"Password123"}'
```

Login and copy the returned `token`:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@example.com","password":"Password123"}'
```

Use the token on protected endpoints:

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Public endpoints do not require a token:

```bash
curl http://localhost:5000/api/hotel/public/rooms
curl "http://localhost:5000/api/hotel/availability?checkIn=2026-07-01&checkOut=2026-07-03"
```

## Authentication

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a guest account |
| POST | `/auth/login` | Login and receive JWT |
| POST | `/auth/logout` | Client-side logout acknowledgement |
| POST | `/auth/forgot-password` | Generate password reset token |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/verify-email` | Verify email token |
| GET | `/auth/me` | Return current user |

## Hotel Operations

| Method | Path | Description |
| --- | --- | --- |
| GET | `/hotel/public/rooms` | Public room showcase data |
| GET | `/hotel/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&roomType=Deluxe` | Check room availability |
| POST | `/hotel/bookings` | Public room booking |
| POST | `/hotel/check-in/:reservationId` | Check in guest and mark room occupied |
| POST | `/hotel/check-out/:checkInId` | Check out guest and mark room for cleaning |

## CRUD Resources

Each resource supports:

- `GET /api/<resource>?search=&limit=50&offset=0`
- `GET /api/<resource>/:id`
- `POST /api/<resource>`
- `PUT /api/<resource>/:id`
- `DELETE /api/<resource>/:id`

Resources:

`roles`, `users`, `customers`, `room-types`, `rooms`, `reservations`, `invoices`, `payments`, `menu-items`, `restaurant-orders`, `restaurant-order-items`, `table-reservations`, `membership-plans`, `trainers`, `gym-members`, `gym-attendance`, `night-club-events`, `tickets`, `vip-reservations`, `meeting-rooms`, `meeting-bookings`, `staff`, `attendance`, `feedback`.

## Reporting

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| GET | `/reports/dashboard` | Administrator, Manager, Accountant | Occupancy, daily/monthly revenue, revenue by module, booking trends, customer stats |

## RBAC Summary

- Administrator: all modules
- Manager: operations and reporting
- Accountant: invoices, payments, reports
- Receptionist: rooms, customers, reservations, check-in/out
- Restaurant Staff: menu, orders, tables
- Gym Staff: plans, members, trainers
- Night Club Staff: events, tickets, VIP reservations
- Guest: public booking and account features
