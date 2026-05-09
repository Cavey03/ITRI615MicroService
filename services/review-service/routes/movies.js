const router = require('express').Router();
const fetch = require('node-fetch');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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

    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    const data = await response.json();

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
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
    );

    const data = await response.json();

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
    const movieId = req.params.id;

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error fetching movie details'
    });
  }
});

module.exports = router;
