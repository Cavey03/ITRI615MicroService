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

// Enable CORS (you can restrict this later)
app.use(cors());

// Parse JSON
app.use(express.json());
app.use(requestLogger);

// ==============================
// RATE LIMITING (GLOBAL)
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: "Too many requests, please try again later",
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
// GLOBAL ERROR HANDLER (IMPORTANT)
// ==============================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Review service running on port ${PORT}`);
});