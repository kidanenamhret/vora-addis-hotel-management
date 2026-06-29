# Vora Addis Hotel Management System

A full-stack, enterprise-grade **Hotel Management System** for Vora Addis Hotel, located in Bambis, Addis Ababa, Ethiopia. Built with a modern React frontend and a Node.js/Express backend backed by an embedded SQLite database.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, React Router v6, Lucide Icons |
| **Backend** | Node.js 22+, Express.js, JWT authentication, RBAC, bcrypt |
| **Database** | SQLite (`node:sqlite` — embedded, zero-config, no server required) |
| **Deployment** | Docker Compose + Nginx reverse proxy |

---

## Features

### 🌐 Public Website

- **Home page** — animated hero, animated statistics counter, facilities grid, featured reviews, call-to-action booking widget with check-in/out dates pre-fill
- **Rooms & Suites page** — filterable catalog (type, guests, max price), alternating layout cards with:
  - **Auto-looping image carousel** (3-second interval, loops infinitely, manual arrows also work)
  - Live availability badge (fetched from backend)
  - Quick Preview modal overlay
  - Room Comparison checkbox (up to 3 rooms side-by-side)
  - Sticky Booking Bar (slides up after 500 px scroll)
  - Special Offers & Packages section (Weekend, Honeymoon, Family, Business)
  - Guest testimonials & hotel statistics
- **Room Detail page** — full amenities breakdown + **In-Room Smart Hub**
- **Booking page** — multi-step form with date validation, guest count, special requests, confirmation
- **About, Gallery, Contact, Restaurant, Gym, Night Club, Meeting Rooms pages**
- **My Bookings** — guest self-service booking history

### 🏨 Room Types

| Type | Bed | Capacity | From |
| --- | --- | --- | --- |
| Single | Single | 1 guest | $89 /night |
| Twin | Twin Beds | 2 guests | $99 /night |
| Standard | Double | 2 guests | $120 /night |
| Deluxe | King | 2 guests | $180 /night |
| Executive | King | 2 guests | $250 /night |
| Suite | King + Living area | 4 guests | $350 /night |

### 📺 In-Room Smart Hub

Every room detail page includes an interactive Smart Hub simulation:

- **AI Pro TV** — greets the guest by name fetched live from the PMS (`GET /public/rooms/:roomNumber/active-guest`). Controls ambient lighting, browses a channel menu, and places in-room dining orders.
- **Smart Telephone** — speed-dial panel for Reception, Room Service, Housekeeping, and Wake-up Call with scripted receptionist responses.

### 🌙 Dark / Light Mode

- Toggle in the header (Moon / Sun icon)
- Preference is **persisted to `localStorage`** (`vora_dark_mode`) and restored on every page load

### 🔐 Authentication & Staff Portal

- Guest self-registration and login
- Staff login with **Role-Based Access Control (RBAC)**:
  - `Administrator`, `Manager`, `Receptionist`, `Accountant`, `Guest`
- JWT-secured API — tokens stored in `localStorage`
- Staff Dashboard (separate from the public site)

### 📊 Management Dashboard

- Room management (CRUD, status updates)
- Reservations (create, modify, cancel, confirm)
- Check-in / Check-out workflow
- Revenue centers: Restaurant, Gym, Night Club, Meeting Rooms
- Payments, customer records, staff attendance, analytics

---

## Prerequisites

### For local development (no Docker)

- **Node.js 22+** and **npm 10+**
- No database server needed — SQLite is embedded

### For Docker setup

- Docker Desktop (or Docker Engine + Docker Compose)

---

## Run Locally (Recommended for Development)

### 1. Install root workspace dependencies

```bash
npm install
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend initialises the SQLite database and seeds demo data automatically on first run.

- API base URL: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

### 3. Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`

> **Note:** Both servers must be running simultaneously. The frontend proxies API calls to port 5000.

---

## Run With Docker

```bash
# From the project root (outputs/vora-addis-hms)
docker compose up --build
```

| URL | Description |
| --- | --- |
| `http://localhost` | Nginx entrypoint (recommended) |
| `http://localhost:5173` | Frontend direct |
| `http://localhost:5000` | Backend API direct |
| `http://localhost:5000/health` | Health check |

Stop:

```bash
docker compose down
```

---

## Quick Smoke Tests

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. List public rooms
curl http://localhost:5000/api/hotel/public/rooms

# 3. Check availability
curl "http://localhost:5000/api/hotel/availability?checkIn=2026-07-01&checkOut=2026-07-03"

# 4. Register a guest
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Guest","email":"guest@example.com","password":"Password123"}'

# 5. Get active guest in room (Smart Hub endpoint)
curl http://localhost:5000/api/hotel/public/rooms/101/active-guest
```

---

## Project Structure

```text
vora-addis-hms/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql          # SQLite schema (rooms, reservations, staff …)
│   │   │   ├── init-sqlite.js      # Auto-creates & seeds the database on boot
│   │   │   └── database.js         # DatabaseSync singleton
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # Register, login, JWT
│   │   │   └── hotel.routes.js     # Rooms, reservations, check-in, Smart Hub
│   │   ├── middleware/             # Auth guard, RBAC, validation
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx          # Sticky header, dark mode toggle, footer
│   │   ├── data/
│   │   │   └── content.js          # Room types, facilities, nav items
│   │   ├── pages/
│   │   │   ├── Website.jsx         # Home, Rooms, About, Gallery … (all public pages)
│   │   │   ├── RoomDetails.jsx     # Room detail + In-Room Smart Hub
│   │   │   ├── Booking.jsx         # Multi-step booking form
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard/          # Staff management screens
│   │   ├── services/
│   │   │   └── api.js              # Axios instance, auth helpers
│   │   └── main.jsx                # React Router config
│   └── package.json
├── docs/                           # API docs, ER diagram, deployment guide
├── nginx/                          # Reverse proxy config
├── docker-compose.yml
└── README.md
```

---

## Default Staff Credentials (Seeded)

All staff accounts share the same default password. Use these to log in to the Staff Dashboard.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | <admin@voraaddis.com> | Vora@2026 |
| Manager | <manager@voraaddis.com> | Vora@2026 |
| Receptionist | <receptionist@voraaddis.com> | Vora@2026 |
| Accountant | <accountant@voraaddis.com> | Vora@2026 |

> ⚠️ Change all passwords before any production deployment.

---

## Production Checklist

- [ ] Replace `JWT_SECRET` with a long random secret (`openssl rand -hex 64`)
- [ ] Configure real SMTP for email verification and password-reset tokens
- [ ] Add TLS certificates at Nginx or your cloud load balancer
- [ ] Move SQLite file to a persistent volume and schedule regular backups
- [ ] Restrict backend port from public internet (expose only via Nginx)
- [ ] Enable access logs, error alerting, and uptime monitoring
