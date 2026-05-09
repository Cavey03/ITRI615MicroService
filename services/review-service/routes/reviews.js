const router = require('express').Router();
const auth   = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Review = require('../models/review');

// ==============================
// VALIDATION
// ==============================
const validateReview = [
  body('movieId').isInt({ min: 1 }).withMessage('Movie ID is required'),
  body('movieTitle')
    .isString().trim().notEmpty().withMessage('Movie title is required')
    .isLength({ max: 255 }).withMessage('Movie title too long'),
  body('moviePosterPath')
    .optional({ nullable: true })
    .isString().isLength({ max: 255 }),
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 3, max: 500 })
    .withMessage('Comment must be 3-500 characters'),
];

const validateUpdate = [
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 3, max: 500 })
    .withMessage('Comment must be 3-500 characters'),
];

// ==============================
// CREATE REVIEW
// ==============================
router.post('/', auth, validateReview, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    const { movieId, movieTitle, moviePosterPath, rating, comment } = req.body;
    const review = await Review.create({
      userId: req.user.id,
      movieId,
      movieTitle,
      moviePosterPath,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this movie' });
    }
    res.status(500).json({ error: 'Error creating review' });
  }
});

// ==============================
// GET MY REVIEWS — all reviews by the current user
// ==============================
router.get('/me', auth, async (req, res) => {
  try {
    const reviews = await Review.getByUserId(req.user.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// ==============================
// GET MY REVIEW for a specific movie (or 404)
// ==============================
router.get('/me/:movieId', auth, async (req, res) => {
  try {
    const review = await Review.getByUserAndMovie(req.user.id, req.params.movieId);
    if (!review) return res.status(404).json({ error: 'No review yet' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching review' });
  }
});

// ==============================
// UPDATE REVIEW (owner only — reviews are private to the author)
// ==============================
router.put('/:id', auth, validateUpdate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    const review = await Review.getById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const updated = await Review.update(req.params.id, {
      rating: req.body.rating,
      comment: req.body.comment,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error updating review' });
  }
});

// ==============================
// DELETE REVIEW (owner only)
// ==============================
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.getById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    await Review.delete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting review' });
  }
});

module.exports = router;
