import { validationResult } from 'express-validator';
import { HttpError } from '../utils/httpError.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  next(new HttpError(422, 'Validation failed', errors.array()));
}

