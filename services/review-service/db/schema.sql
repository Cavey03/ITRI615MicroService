-- Enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Reviews (movie identity comes from TMDB, we only store the TMDB movie ID)
CREATE TABLE IF NOT EXISTS reviews (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tmdb_movie_id   INTEGER  NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
  body            TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tmdb_movie_id)
);

-- Movie lists (a named collection owned by a user)
CREATE TABLE IF NOT EXISTS movie_lists (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- List items (TMDB movie IDs saved inside a list)
CREATE TABLE IF NOT EXISTS list_items (
  id            SERIAL PRIMARY KEY,
  list_id       INTEGER NOT NULL REFERENCES movie_lists(id) ON DELETE CASCADE,
  tmdb_movie_id INTEGER NOT NULL,
  added_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (list_id, tmdb_movie_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id      ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tmdb_movie   ON reviews(tmdb_movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_lists_user_id  ON movie_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id   ON list_items(list_id);
