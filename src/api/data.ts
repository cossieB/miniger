import { query } from "@solidjs/router"
import { Studio, Actor, FilmTag, ActorFilm, DetailedFilm } from "../datatypes"
import { invoke } from "@tauri-apps/api/core"
import { getDatabase } from "./db"

export const getFilms = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select(`
    WITH tq AS (
        SELECT JSON_GROUP_ARRAY(tag) tags, film_id
        FROM film_tag
        GROUP BY film_id
    ), aq AS (
        SELECT JSON_GROUP_ARRAY(JSON_OBJECT('actor_id', actor_id, 'name', name, 'image', image, 'dob', dob, 'nationality', nationality, 'gender', gender)) actors, film_id
        FROM actor_film
        JOIN actor USING(actor_id)
        GROUP BY film_id
    )
    
    SELECT 
        film.*, 
        studio.name AS studio_name,
        COALESCE(tags, '[]') as tags,
        COALESCE(actors, '[]') as actors
    FROM film
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING(film_id)
    LEFT JOIN aq USING(film_id)
    ORDER BY LOWER(title)
    `) as DetailedFilm[]
}, 'films')

export const getStudios = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select("SELECT * FROM studio ORDER BY name ASC") as Studio[]
}, 'studios')

export const getActors = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select("SELECT * FROM actor ORDER BY name") as Actor[]
}, 'actors')

export const getFilmTags = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select("SELECT * FROM film_tag") as FilmTag[]
}, 'tags')

export const getActorFilms = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select("SELECT * FROM actor_film") as ActorFilm[]
}, 'appearances')

export const getInaccessible = query(async () => {
    await using db = await getDatabase()
    const films = await db.connection.select("SELECT title, path FROM film")
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string }[]
}, 'inaccessible')

export const getFilmsByTag = query(async (tag: string) => {
    await using db = await getDatabase()
    const decoded = decodeURI(tag);
    return await db.connection.select(`
    WITH fq AS (
        SELECT film_id FROM film_tag WHERE tag = $1
    ), tq AS (
        SELECT JSON_GROUP_ARRAY(tag) tags, film_id
        FROM film_tag
        GROUP BY film_id
    ), aq AS (
        SELECT JSON_GROUP_ARRAY(JSON_OBJECT('actor_id', actor_id, 'name', name, 'image', image, 'dob', dob, 'nationality', nationality, 'gender', gender)) actors, film_id
        FROM actor_film
        JOIN actor USING(actor_id)
        GROUP BY film_id
    )
    
    SELECT 
        film.*, 
        studio.name AS studio_name,
        COALESCE(tags, '[]') as tags,
        COALESCE(actors, '[]') as actors
    FROM film
    JOIN fq USING (film_id)
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING(film_id)
    LEFT JOIN aq USING(film_id)
    `, [decoded]) as DetailedFilm[]
}, 'filmsByTag')

export const getFilmsByActor = query(async (actorId: number) => {
    await using db = await getDatabase()
    return await db.connection.select(`
    WITH tq AS (
        SELECT JSON_GROUP_ARRAY(tag) tags, film_id
        FROM film_tag
        GROUP BY film_id
    ), aq AS (
        SELECT JSON_GROUP_ARRAY(JSON_OBJECT('actor_id', actor_id, 'name', name, 'image', image, 'dob', dob, 'nationality', nationality, 'gender', gender)) actors, film_id
        FROM actor_film
        JOIN actor USING(actor_id)
        GROUP BY film_id
    )

    SELECT 
        film.*,
        studio.name AS studio_name,
        COALESCE(tags, '[]') as tags,
        COALESCE(actors, '[]') as actors        
    FROM actor_film 
    JOIN film USING (film_id)
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING (film_id)
    LEFT JOIN aq USING (film_id)
    WHERE actor_id = $1
    `, [actorId]) as DetailedFilm[]
}, "filmsByActor")

export const getFilmsByStudio = query(async (studioId: number) => {
    await using db = await getDatabase()
    return await db.connection.select(`
    WITH tq AS (
        SELECT JSON_GROUP_ARRAY(tag) tags, film_id
        FROM film_tag
        GROUP BY film_id
    ), aq AS (
        SELECT JSON_GROUP_ARRAY(JSON_OBJECT('actor_id', actor_id, 'name', name, 'image', image, 'dob', dob, 'nationality', nationality, 'gender', gender)) actors, film_id
        FROM actor_film
        JOIN actor USING(actor_id)
        GROUP BY film_id
    )
    
    SELECT 
        film.*, 
        studio.name AS studio_name,
        COALESCE(tags, '[]') as tags,
        COALESCE(actors, '[]') as actors
    FROM film
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING(film_id)
    LEFT JOIN aq USING(film_id)
    WHERE studio_id = $1
    `, [studioId]) as DetailedFilm[]    
}, "filmsByStudio")

export const getFilmByPath = query(async (path: string) => {
    await using db = await getDatabase()
    return await db.connection.select(`
    WITH tq AS (
        SELECT JSON_GROUP_ARRAY(tag) tags, film_id
        FROM film_tag
        GROUP BY film_id
    ), aq AS (
        SELECT JSON_GROUP_ARRAY(JSON_OBJECT('actor_id', actor_id, 'name', name, 'image', image, 'dob', dob, 'nationality', nationality, 'gender', gender)) actors, film_id
        FROM actor_film
        JOIN actor USING(actor_id)
        GROUP BY film_id
    )
    
    SELECT 
        film.*, 
        studio.name AS studio_name,
        COALESCE(tags, '[]') as tags,
        COALESCE(actors, '[]') as actors
    FROM film
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING(film_id)
    LEFT JOIN aq USING (film_id)
    WHERE path = $1
    `, [path]) as DetailedFilm[]
}, 'filmByPath')

export const getActorsByFilm = query(async (filmId: number) => {
    await using db = await getDatabase()
    return await db.connection.select(`
    SELECT actor.*
    FROM actor_film
    JOIN actor using(actor_id)
    WHERE film_id = $1
    `, [filmId]) as Actor[]
}, "actorsByFilm")