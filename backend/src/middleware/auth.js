import { query } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { verifyToken } from '../utils/tokens.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) throw new HttpError(401, 'Authentication token is required');

    const payload = verifyToken(token);
    const { rows } = await query(
      `SELECT u.id, u.full_name, u.email, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [payload.sub]
    );
    if (!rows[0]) throw new HttpError(401, 'User account no longer exists');
    req.user = rows[0];
    next();
  } catch (error) {
    next(error.status ? error : new HttpError(401, 'Invalid or expired token'));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, 'Authentication is required'));
    if (!roles.includes(req.user.role_name)) {
      return next(new HttpError(403, 'You do not have permission for this action'));
    }
    next();
  };
}

