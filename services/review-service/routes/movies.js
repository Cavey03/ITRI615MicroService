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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Surface TMDB's own status so callers don't think a 200 is success.
    const err = new Error(data.status_message || 'TMDB request failed');
    err.status = response.status;
    throw err;
  }
  return data;
}

// ======================================
// SEARCH MOVIES
// GET /movies/search?query=batman&page=1
// Filters: no adult content, vote_count >= 50 (drops obscure entries),
// sorted by vote_count descending so well-known films float up.
// ======================================
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query;
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);

    if (!query) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const data = await tmdb('/search/movie', {
      query,
      page,
      include_adult: false,
    });

    if (Array.isArray(data.results)) {
      data.results = data.results
        .filter(m => !m.adult && (m.vote_count || 0) >= 50)
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 502;
    res.status(status).json({ message: 'Error searching movies' });
  }
});

// ======================================
// GET TRENDING MOVIES (homepage feed)
// GET /movies/popular?page=1
// Uses TMDB's "trending this week" — more relevant than /movie/popular.
// ======================================
router.get('/popular', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const data = await tmdb('/trending/movie/week', {
      page,
      include_adult: false,
    });

    if (Array.isArray(data.results)) {
      data.results = data.results.filter(m => !m.adult);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 502;
    res.status(status).json({ message: 'Error fetching trending movies' });
  }
});

// ======================================
// GET MOVIE DETAILS (with trailers and cast in one call)
// GET /movies/:id
// ======================================
router.get('/:id', async (req, res) => {
  try {
    const data = await tmdb(`/movie/${req.params.id}`, {
      append_to_response: 'videos,credits',
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 502;
    res.status(status).json({ message: 'Error fetching movie details' });
  }
});

// ======================================
// GET TMDB COMMUNITY REVIEWS for a movie
// GET /movies/:id/reviews
// ======================================
router.get('/:id/reviews', async (req, res) => {
  try {
    const data = await tmdb(`/movie/${req.params.id}/reviews`);
    res.json(data);
  } catch (err) {
    console.error(err);
    const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 502;
    res.status(status).json({ message: 'Error fetching community reviews' });
  }
});

module.exports = router;
