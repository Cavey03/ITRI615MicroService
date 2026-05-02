const router = require('express').Router();
const Joi    = require('joi');

const TMDB_BASE  = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.TMDB_API_KEY;

// Helper — fetch from TMDB with auth header
async function tmdb(path) {
  const res = await fetch(`${TMDB_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = new Error(`TMDB error: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// ==============================
// GET POPULAR MOVIES
// ==============================
router.get('/', async (req, res) => {
  const { error, value } = Joi.object({
    page: Joi.number().integer().min(1).max(500).default(1),
  }).validate(req.query);

  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const data = await tmdb(`/movie/popular?page=${value.page}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Failed to fetch movies' });
  }
});

// ==============================
// SEARCH MOVIES
// ==============================
router.get('/search', async (req, res) => {
  const { error, value } = Joi.object({
    q:    Joi.string().min(1).max(100).required(),
    page: Joi.number().integer().min(1).max(500).default(1),
  }).validate(req.query);

  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const encoded = encodeURIComponent(value.q);
    const data = await tmdb(`/search/movie?query=${encoded}&page=${value.page}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Failed to search movies' });
  }
});

// ==============================
// GET MOVIE BY ID
// ==============================
router.get('/:id', async (req, res) => {
  const { error, value } = Joi.object({
    id: Joi.number().integer().min(1).required(),
  }).validate({ id: req.params.id });

  if (error) return res.status(400).json({ error: 'Invalid movie ID' });

  try {
    const data = await tmdb(`/movie/${value.id}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Failed to fetch movie' });
  }
});

module.exports = router;
