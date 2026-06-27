# Deployment Guide

## Docker Deployment

1. Install Docker Desktop or Docker Engine with Docker Compose.

2. Open the project folder:

```bash
cd outputs/vora-addis-hms
```

3. Update production values in `docker-compose.yml`:

- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `CLIENT_ORIGIN`
- exposed ports, if needed

4. Build and start services:

```bash
docker compose up --build -d
```

5. Confirm services are running:

```bash
docker compose ps
curl http://localhost/health
curl http://localhost:5000/health
```

6. Watch logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

7. Stop services:

```bash
docker compose down
```

8. Reset all database data and initialize again from schema/seed:

```bash
docker compose down -v
docker compose up --build -d
```

PostgreSQL initializes automatically from `backend/src/db/schema.sql` and `backend/src/db/seed.sql` only when the database volume is first created.

## Local Development Deployment

1. Install Node.js 20+, npm 10+, PostgreSQL 16+, and `psql`.

2. Create a database:

```bash
createdb vora_addis_hms
```

3. Set the database URL.

PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/vora_addis_hms"
```

macOS/Linux:

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/vora_addis_hms"
```

4. Apply schema and seed data:

```bash
psql "$DATABASE_URL" -f backend/src/db/schema.sql
psql "$DATABASE_URL" -f backend/src/db/seed.sql
```

5. Configure backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

6. In a second terminal, start frontend:

```bash
cd frontend
npm install
npm run dev
```

7. Verify the app:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/hotel/public/rooms
```

Open http://localhost:5173 in a browser.

## Production Build Without Docker

1. Start PostgreSQL and run schema/seed.
2. Configure backend `.env`.
3. Install backend dependencies and start the API:

```bash
cd backend
npm install --omit=dev
npm start
```

4. Build frontend:

```bash
cd frontend
npm install
npm run build
```

5. Serve `frontend/dist` behind Nginx.
6. Proxy `/api` to the backend service, normally `http://127.0.0.1:5000`.
7. Configure HTTPS at Nginx or at your cloud load balancer.

## Common Troubleshooting

- If `docker` is not recognized, install Docker Desktop and restart the terminal.
- If port `80`, `5173`, `5000`, or `5432` is busy, edit the host port in `docker-compose.yml`.
- If database tables are missing in Docker, run `docker compose down -v` and start again.
- If CORS blocks requests, set `CLIENT_ORIGIN` to the exact frontend URL.
- If protected routes return `401`, login again and send `Authorization: Bearer <token>`.

## Security Checklist

- Use HTTPS.
- Rotate JWT secrets.
- Store reset and verification tokens securely; connect SMTP before production.
- Enable database backups.
- Limit admin accounts and enforce least-privilege roles.
- Monitor `audit_logs` for destructive actions.
