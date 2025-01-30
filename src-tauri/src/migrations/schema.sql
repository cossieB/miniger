CREATE TABLE IF NOT EXISTS actor (
    actor_id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT,
    nationality TEXT,
    gender TEXT,
    image TEXT
);

CREATE TABLE IF NOT EXISTS film (
    film_id INTEGER NOT NULL PRIMARY KEY,
    path text NOT NULL UNIQUE,
    title TEXT NOT NULL,
    studio_id INTEGER,
    release_date TEXT
);

CREATE TABLE IF NOT EXISTS studio (
    studio_id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT
);

CREATE TABLE IF NOT EXISTS actor_film (
    actor_id INTEGER NOT NULL,
    film_id INTEGER NOT NULL,

    PRIMARY KEY(actor_id, film_id)
);

CREATE TABLE IF NOT EXISTS film_tag (
    film_id INTEGER NOT NULL,
    tag TEXT NOT NULL,

    PRIMARY KEY(film_id, tag)
);
