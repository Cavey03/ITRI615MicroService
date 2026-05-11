require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'TMDB_API_KEY'];
const missing = requiredEnv.filter(v => !process.env[v]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { requestLogger } = require('./middleware/requestLogger');
const authRoutes   = require('./routes/auth');
const movieRoutes  = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');

const app = express();

// ==============================
// SECURITY MIDDLEWARE
// ==============================

// Secure HTTP headers
app.use(helmet());

// CORS — strict allowlist (same env var as the gateway)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));

// Parse JSON
app.use(express.json());
app.use(requestLogger);

// ==============================
// RATE LIMITING (GLOBAL)
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: { error: 'Too many requests, please try again later.' },
});

app.use(limiter);

// ==============================
// ROUTES
// ==============================
app.use('/auth',    authRoutes);
app.use('/movies',  movieRoutes);
app.use('/reviews', reviewRoutes);

// ==============================
// HEALTH CHECK
// ==============================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'review-service' });
});

// ==============================
// GLOBAL ERROR HANDLER
// Log the full error internally; never leak internal messages on 5xx
// responses (could expose DB schema, stack details, etc.).
// ==============================
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const safeMessage = status >= 500
    ? 'Internal server error'
    : (err.message || 'Request failed');

  res.status(status).json({ error: safeMessage });
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Review service running on port ${PORT}`);
});