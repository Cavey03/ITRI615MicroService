// Step 8: Review model — placeholder
const db = require("../db/connection");

// ==============================
// CREATE REVIEW
// ==============================
exports.create = async ({ userId, movieId, rating, comment }) => {
  try {
    const result = await db.query(
      `INSERT INTO reviews (user_id, tmdb_movie_id, rating, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, movieId, rating, comment]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error creating review:", err);
    throw err;
  }
};

// ==============================
// GET REVIEWS BY MOVIE (TMDB ID)
// ==============================
exports.getByMovieId = async (movieId) => {
  try {
    const result = await db.query(
      `SELECT * FROM reviews
       WHERE tmdb_movie_id = $1
       ORDER BY created_at DESC`,
      [movieId]
    );

    return result.rows;
  } catch (err) {
    console.error("Error fetching reviews:", err);
    throw err;
  }
};

// ==============================
// GET REVIEW BY ID
// ==============================
exports.getById = async (id) => {
  try {
    const result = await db.query(
      `SELECT * FROM reviews WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error fetching review:", err);
    throw err;
  }
};

// ==============================
// UPDATE REVIEW
// ==============================
exports.update = async (id, { rating, comment }) => {
  try {
    const result = await db.query(
      `UPDATE reviews
       SET rating = $1,
           body = $2
       WHERE id = $3
       RETURNING *`,
      [rating, comment, id]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error updating review:", err);
    throw err;
  }
};

// ==============================
// DELETE REVIEW
// ==============================
exports.delete = async (id) => {
  try {
    await db.query(
      `DELETE FROM reviews WHERE id = $1`,
      [id]
    );

    return { message: "Review deleted successfully" };
  } catch (err) {
    console.error("Error deleting review:", err);
    throw err;
  }
};