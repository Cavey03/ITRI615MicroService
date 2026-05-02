const router  = require('express').Router();
const auth    = require('../middleware/auth');
const roles   = require('../middleware/roles');
const { body, validationResult } = require('express-validator');
const Review  = require('../models/review');

// ==============================
// VALIDATION
// ==============================
const validateReview = [
  body('movieId').notEmpty().withMessage('Movie ID is required'),
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage('Comment must be 3-500 characters'),
];

const validateUpdate = [
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage('Comment must be 3-500 characters'),
];

// ==============================
// CREATE REVIEW (authenticated users only)
// ==============================
router.post('/', auth, roles('user', 'admin'), validateReview, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    const { movieId, rating, comment } = req.body;
    const review = await Review.create({ userId: req.user.id, movieId, rating, comment });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'You have already reviewed this movie' });
    }
    res.status(500).json({ error: 'Error creating review' });
  }
});

// ==============================
// GET REVIEWS BY MOVIE (public)
// ==============================
router.get('/:movieId', async (req, res) => {
  try {
    const reviews = await Review.getByMovieId(req.params.movieId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// ==============================
// UPDATE REVIEW (owner or admin)
// ==============================
router.put('/:id', auth, validateUpdate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    const review = await Review.getById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const updated = await Review.update(req.params.id, { rating: req.body.rating, comment: req.body.comment });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error updating review' });
  }
});

// ==============================
// DELETE REVIEW (owner or admin)
// ==============================
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.getById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }

    await Review.delete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting review' });
  }
});

module.exports = router;
