require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
const missing = requiredEnv.filter(v => !process.env[v]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { requestLogger } = require('./middleware/requestLogger');
const authRoutes   = require('./routes/auth');
const movieRoutes  = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/auth',    authRoutes);
app.use('/movies',  movieRoutes);
app.use('/reviews', reviewRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'review-service' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Review service running on port ${PORT}`);
});
