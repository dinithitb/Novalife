require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const { errorHandler, notFound } = require('./middlewares/errors');

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '2mb' }));

// ── CORS: only allow requests from the frontend ───────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server-to-server
    if (process.env.NODE_ENV !== 'production') {
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    if (allowedOrigins.length === 0) return callback(null, true); // no restriction if empty
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods:       ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:   true,
}));

// ── Rate limiting: max 300 requests per minute per IP ────────────────────────
app.use(rateLimit({ windowMs: 60_000, limit: 300 }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'ok', app: 'Novalife API' }));

// ── Public routes (no login needed) ──────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));

// ── Protected routes (JWT required) ──────────────────────────────────────────
const auth = require('./middlewares/auth');

app.use('/api/branches',     auth, require('./routes/branches.routes'));
app.use('/api/donors',       auth, require('./routes/donors.routes'));
app.use('/api/units',        auth, require('./routes/units.routes'));
app.use('/api/requests',     auth, require('./routes/requests.routes'));
app.use('/api/transfers',    auth, require('./routes/transfers.routes'));
app.use('/api/notifications',auth, require('./routes/notifications.routes'));
app.use('/api/dashboard',    auth, require('./routes/dashboard.routes'));
app.use('/api/users',        auth, require('./routes/users.routes'));
app.use('/api/reports',      auth, require('./routes/reports.routes'));
app.use('/api/audit',        auth, require('./routes/audit.routes'));

// ── Error handling (MUST be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
