require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());

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
});
