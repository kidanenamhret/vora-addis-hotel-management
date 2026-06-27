# Docker Run Steps

Use this for the quickest full-stack run.

## 1. Start The Stack

```bash
cd outputs/vora-addis-hms
docker compose up --build
```

## 2. Open Services

- Website through Nginx: http://localhost
- Frontend direct container: http://localhost:5173
- Backend direct API: http://localhost:5000
- Backend health: http://localhost:5000/health

## 3. View Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## 4. Stop The Stack

```bash
docker compose down
```

## 5. Reset Database

This deletes the Docker database volume and reloads schema/seed files.

```bash
docker compose down -v
docker compose up --build
```
