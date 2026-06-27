# Backend Folder Structure

```text
backend/
  src/
    config/          Environment and PostgreSQL pool
    db/              PostgreSQL schema and seed data
    middleware/      Auth, RBAC, validation, audit, error handling
    routes/          Auth, hotel workflow, reports, CRUD routers
    services/        Reusable data access services
    utils/           Error and token utilities
```

The backend uses parameterized SQL through `pg`, input validation through `express-validator`, password hashing through `bcryptjs`, JWT authentication, RBAC authorization, Helmet, CORS, rate limiting, and audit logs.
