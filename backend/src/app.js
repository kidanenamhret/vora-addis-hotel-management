import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { authRouter } from './routes/auth.routes.js';
import { buildCrudRouter } from './routes/crudRouter.js';
import { hotelRouter } from './routes/hotel.routes.js';
import { reportsRouter } from './routes/reports.routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'vora-addis-hms-api' }));
app.use('/api/auth', authRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/reports', reportsRouter);
app.use('/api', buildCrudRouter());

app.use(notFound);
app.use(errorHandler);

