const router = require('express').Router();

// Step 8: Review CRUD routes go here
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const { body, validationResult } = require("express-validator");

const Review = require("../models/review");

// ==============================
// VALIDATION
// ==============================
const validateReview = [
  body("movieId").notEmpty().withMessage("Movie ID is required"),
  body("rating")
    .isInt({ min: 1, max: 10 })
    .withMessage("Rating must be between 1 and 10"),
  body("comment")
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage("Comment must be 3–500 characters"),
];

// ==============================
// CREATE REVIEW
// ==============================
router.post(
  "/",
  auth,
  roles("user", "admin"),
  validateReview,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    try {
      const { movieId, rating, comment } = req.body;

      const review = await Review.create({
        userId: req.user.id,
        movieId,
        rating,
        comment,
      });

      res.status(201).json(review);
    } catch (err) {
      // Handle duplicate review (UNIQUE constraint)
      if (err.code === "23505") {
        return res.status(400).json({
          message: "You have already reviewed this movie",
        });
      }

      console.error(err);
      res.status(500).json({ message: "Error creating review" });
    }
  }
);

// ==============================
// GET REVIEWS BY MOVIE (PUBLIC)
// ==============================
router.get("/:movieId", async (req, res) => {
  try {
    const reviews = await Review.getByMovieId(req.params.movieId);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// ==============================
// UPDATE REVIEW
// ==============================
router.put("/:id", auth, validateReview, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors.array());

  try {
    const review = await Review.getById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Ownership or admin
    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Review.update(req.params.id, {
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating review" });
  }
});

// ==============================
// DELETE REVIEW
// ==============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.getById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Ownership or admin
    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Review.delete(req.params.id);

    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting review" });
  }
});

module.exports = router;
