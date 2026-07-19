CREATE TABLE IF NOT EXISTS actor (
    actor_id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT,
    nationality TEXT,
    gender TEXT,
    image TEXT
);

CREATE TABLE IF NOT EXISTS studio (
    studio_id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT
);

CREATE TABLE IF NOT EXISTS film (
    film_id INTEGER NOT NULL PRIMARY KEY,
    path text NOT NULL UNIQUE,
    title TEXT NOT NULL,
    studio_id INTEGER,
    release_date DATETIME,
    date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT,
    
    FOREIGN KEY (studio_id) REFERENCES studio(studio_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS actor_film (
    actor_id INTEGER NOT NULL,
    film_id INTEGER NOT NULL,

    PRIMARY KEY(actor_id, film_id),
    FOREIGN KEY (actor_id) REFERENCES actor(actor_id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES film(film_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS film_tag (
    film_id INTEGER NOT NULL,
    tag TEXT NOT NULL,

    PRIMARY KEY(film_id, tag),
    FOREIGN KEY (film_id) REFERENCES film(film_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_film_title_lower ON film(LOWER(title));
CREATE INDEX IF NOT EXISTS idx_actor_film_film_actor ON actor_film(film_id, actor_id);
CREATE INDEX IF NOT EXISTS idx_film_tag_tag_film ON film_tag(tag, film_id);
CREATE INDEX IF NOT EXISTS idx_film_studio_id ON film(studio_id);