require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes   = require('./routes/auth');
const movieRoutes  = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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
