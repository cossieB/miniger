import { query } from "@solidjs/router"
import type { Studio, Actor, DetailedDbFilm } from "../datatypes"
import { invoke } from "@tauri-apps/api/core"
import { getDatabase } from "./db"

export const getFilms = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<DetailedDbFilm[]>(`
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
    `)
}, 'films')

export const getStudios = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<Studio[]>("SELECT * FROM studio ORDER BY LOWER(name) ASC") 
}, 'studios')

export const getActors = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<Actor[]>("SELECT * FROM actor ORDER BY LOWER(name)")
}, 'actors')

export const getInaccessible = query(async () => {
    await using db = await getDatabase()
    const films = await db.connection.select("SELECT title, path FROM film")
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string }[]
}, 'inaccessible')

export const getFilmsByTag = query(async (tag: string) => {
    await using db = await getDatabase()
    const decoded = decodeURI(tag);
    return await db.connection.select<DetailedDbFilm[]>(`
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
    ORDER BY LOWER(title)
    `, [decoded])
}, 'filmsByTag')

export const getFilmsByActor = query(async (actorId: number) => {
    await using db = await getDatabase()
    return await db.connection.select<DetailedDbFilm[]>(`
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
    ORDER BY LOWER(title)
    `, [actorId])
}, "filmsByActor")

export const getFilmsByStudio = query(async (studioId: number) => {
    await using db = await getDatabase()
    return await db.connection.select<DetailedDbFilm[]>(`
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
    ORDER BY LOWER(title)
    `, [studioId]) 
}, "filmsByStudio")

export const getFilmByPath = query(async (path: string) => {
    await using db = await getDatabase()
    const res = await db.connection.select<DetailedDbFilm[]>(`
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
    `, [path]) 
    return res.at(0) ?? null
}, 'filmByPath')

export const getTags = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<{ tag: string }[]>("SELECT DISTINCT tag FROM film_tag ORDER BY tag ASC")
}, 'getTags')