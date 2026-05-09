const db = require("../db/connection");

exports.create = async ({ userId, movieId, movieTitle, moviePosterPath, rating, comment }) => {
  const result = await db.query(
    `INSERT INTO reviews (user_id, tmdb_movie_id, movie_title, movie_poster_path, rating, body)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, movieId, movieTitle, moviePosterPath || null, rating, comment]
  );
  return result.rows[0];
};

exports.getById = async (id) => {
  const result = await db.query(`SELECT * FROM reviews WHERE id = $1`, [id]);
  return result.rows[0];
};

exports.getByUserId = async (userId) => {
  const result = await db.query(
    `SELECT * FROM reviews
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

exports.getByUserAndMovie = async (userId, movieId) => {
  const result = await db.query(
    `SELECT * FROM reviews
     WHERE user_id = $1 AND tmdb_movie_id = $2`,
    [userId, movieId]
  );
  return result.rows[0];
};

exports.update = async (id, { rating, comment }) => {
  const result = await db.query(
    `UPDATE reviews
     SET rating = $1,
         body = $2
     WHERE id = $3
     RETURNING *`,
    [rating, comment, id]
  );
  return result.rows[0];
};

exports.delete = async (id) => {
  await db.query(`DELETE FROM reviews WHERE id = $1`, [id]);
};
