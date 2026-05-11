require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// ==============================
// CORS — strict allowlist
// ==============================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500')
  .split(',').map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server / curl / Postman (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
};

app.use(cors(corsOptions));

// ==============================
// SECURITY HEADERS
// Helmet defaults — the gateway only returns JSON, so the default CSP and
// other restrictive headers are safe and a good security signal.
// ==============================
app.use(helmet());

// ==============================
// RATE LIMITING
// ==============================
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

const SERVICE_URL = `http://localhost:${process.env.PORT || 3000}`;

app.use('/', createProxyMiddleware({
  target: SERVICE_URL,
  changeOrigin: true,
}));

const GATEWAY_PORT = process.env.GATEWAY_PORT || 8080;
app.listen(GATEWAY_PORT, () => {
  console.log(`API gateway running on port ${GATEWAY_PORT} → proxying to ${SERVICE_URL}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
