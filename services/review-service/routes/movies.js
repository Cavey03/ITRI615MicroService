const router = require('express').Router();
const fetch = require('node-fetch');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// TMDB v4 Read Access Token authentication.
// Sending the token as an Authorization header (instead of a query param)
// keeps it out of URLs, browser history, and access logs.
const tmdbHeaders = {
  Authorization: `Bearer ${TMDB_API_KEY}`,
  Accept: 'application/json',
};

async function tmdb(path, query = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const response = await fetch(url, { headers: tmdbHeaders });
  return response.json();
}

// ======================================
// SEARCH MOVIES
// GET /movies/search?query=batman
// ======================================
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const data = await tmdb('/search/movie', { query });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error searching movies'
    });
  }
});

// ======================================
// GET POPULAR MOVIES
// GET /movies/popular
// ======================================
router.get('/popular', async (req, res) => {
  try {
    const data = await tmdb('/movie/popular');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error fetching popular movies'
    });
  }
});

// ======================================
// GET MOVIE DETAILS
// GET /movies/:id
// ======================================
router.get('/:id', async (req, res) => {
  try {
    const data = await tmdb(`/movie/${req.params.id}`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error fetching movie details'
    });
  }
});

module.exports = router;
