import { query } from '../config/db.js';

export function audit(action, entity) {
  return async (req, _res, next) => {
    try {
      await query(
        `INSERT INTO audit_logs (actor_user_id, action, entity, entity_id, metadata, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user?.id || null,
          action,
          entity,
          req.params.id || null,
          JSON.stringify({ body: req.body, query: req.query }),
          req.ip
        ]
      );
    } catch {
      // Audit failures should be monitored, but must not block hotel operations.
    }
    next();
  };
}

