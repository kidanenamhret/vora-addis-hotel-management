# Local Run Steps

Use this when you want to run the app directly on your machine instead of Docker.

## 1. Start PostgreSQL

Create the database:

```bash
createdb vora_addis_hms
```

Set the connection string.

PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/vora_addis_hms"
```

macOS/Linux:

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/vora_addis_hms"
```

## 2. Load Schema And Seed Data

From the project root:

```bash
psql "$DATABASE_URL" -f backend/src/db/schema.sql
psql "$DATABASE_URL" -f backend/src/db/seed.sql
```

## 3. Run Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend URL: http://localhost:5000

## 4. Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## 5. Test The App

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/hotel/public/rooms
```

Open http://localhost:5173 in the browser.
