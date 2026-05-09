-- Migration 001: snapshot movie title and poster on reviews
-- Run once against an existing database. New installs from schema.sql don't need this.
--
-- Usage (PowerShell, from the project root):
--   "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d moviereview -f "services/review-service/db/migrations/001_add_movie_snapshot_to_reviews.sql"

BEGIN;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS movie_title       VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS movie_poster_path VARCHAR(255);

-- Backfill any existing rows with a placeholder so we can enforce NOT NULL.
UPDATE reviews SET movie_title = 'Unknown' WHERE movie_title IS NULL;

ALTER TABLE reviews ALTER COLUMN movie_title SET NOT NULL;

COMMIT;
