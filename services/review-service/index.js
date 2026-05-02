require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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