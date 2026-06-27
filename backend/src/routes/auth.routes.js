import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { signToken } from '../utils/tokens.js';

export const authRouter = Router();

authRouter.post('/register',
  body('fullName').isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  asyncHandler(async (req, res) => {
    const { fullName, email, phone, password } = req.body;
    const roleResult = await query('SELECT id FROM roles WHERE name = $1', ['Guest']);
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const { rows } = await query(
      `INSERT INTO users (role_id, full_name, email, phone, password_hash, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, is_verified`,
      [roleResult.rows[0].id, fullName, email, phone || null, passwordHash, verificationToken]
    );
    res.status(201).json({ user: rows[0], verificationToken });
  })
);

authRouter.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = $1`,
      [req.body.email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role_name }
    });
  })
);

authRouter.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  validate,
  asyncHandler(async (req, res) => {
    const resetToken = crypto.randomBytes(24).toString('hex');
    await query(
      `UPDATE users SET reset_token = $1, reset_expires_at = NOW() + INTERVAL '30 minutes' WHERE email = $2`,
      [resetToken, req.body.email]
    );
    res.json({ message: 'If the email exists, a reset token has been generated.', resetToken });
  })
);

authRouter.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  validate,
  asyncHandler(async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const { rowCount } = await query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_expires_at = NULL
       WHERE reset_token = $2 AND reset_expires_at > NOW()`,
      [passwordHash, req.body.token]
    );
    if (!rowCount) throw new HttpError(400, 'Invalid or expired reset token');
    res.json({ message: 'Password reset successful' });
  })
);

authRouter.post('/verify-email',
  body('token').notEmpty(),
  validate,
  asyncHandler(async (req, res) => {
    const { rowCount } = await query(
      `UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1`,
      [req.body.token]
    );
    if (!rowCount) throw new HttpError(400, 'Invalid verification token');
    res.json({ message: 'Email verified' });
  })
);

authRouter.post('/logout', authenticate, (_req, res) => {
  res.json({ message: 'Logout successful. Remove the token on the client.' });
});

authRouter.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

