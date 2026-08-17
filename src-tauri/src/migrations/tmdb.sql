ALTER TABLE actor ADD COLUMN tmdb_id INTEGER;
ALTER TABLE film ADD COLUMN tmdb_id INTEGER;

CREATE UNIQUE INDEX idx_actor_tmdb_id ON actor(tmdb_id);
CREATE UNIQUE INDEX idx_film_tmdb_id ON film(tmdb_id);