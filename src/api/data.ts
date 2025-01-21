import { query } from "@solidjs/router"
import Database from "@tauri-apps/plugin-sql"
import { Film, Studio, Actor, FilmTag, ActorFilm } from "../datatypes"
import { invoke } from "@tauri-apps/api/core"

export const getFilms = query(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select(`
    WITH tq AS (
        SELECT GROUP_CONCAT(tag, ', ') tags, film_id
        FROM film_tag
        GROUP BY film_id
    )
    
    SELECT 
        film.*, 
        studio.name AS studio_name,
        tags
    FROM film
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING(film_id)
    ORDER BY LOWER(title)
    `) as (Film & {studio_name: string | null, tags: string | null})[]
}, 'films')

export const getStudios = query(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM studio ORDER BY name ASC") as Studio[]
}, 'studios')

export const getActors = query(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM actor ORDER BY name") as Actor[]
}, 'actors')

export const getFilmTags = query(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM film_tag") as FilmTag[]
}, 'tags')

export const getActorFilms = query(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM actor_film") as ActorFilm[]
}, 'appearances')

export const getInaccessible = query(async () => {
    const db = await Database.load("sqlite:mngr.db");
    const films = await db.select("SELECT title, path FROM film")
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string }[]
}, 'inaccessible')

export const getFilmsByTag = query(async (tag: string) => {
    const decoded = decodeURI(tag);
    const db = await Database.load("sqlite:mngr.db")
    return await db.select(`
    WITH fq AS (
        SELECT film_id FROM film_tag WHERE tag = $1
    ), tq AS (
        SELECT GROUP_CONCAT(tag, ', ') tags, film_id
        FROM film_tag
        GROUP BY film_id
    )
    
    SELECT 
        film.*, 
        studio.name AS studio_name,
        tags
    FROM film
    JOIN fq USING (film_id)
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING(film_id)
    `, [decoded]) as (Film & {studio_name: string | null, tags: string | null})[]
}, 'filmsByTag')

export const getFilmsByActor = query(async (actorId: number) => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select(`
    WITH tq AS (
        SELECT GROUP_CONCAT(tag, ', ') tags, film_id
        FROM film_tag
        GROUP BY film_id
    )

    SELECT 
        film.*,
        studio.name AS studio_name,
        tags        
    FROM actor_film 
    JOIN film USING (film_id)
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING (film_id)
    WHERE actor_id = $1
    `, [actorId]) as (Film & {studio_name: string | null, tags: string | null})[]
}, "filmsByActor")

export const getFilmsByStudio = query(async (studioId: number) => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select(`
    WITH tq AS (
        SELECT GROUP_CONCAT(tag, ', ') tags, film_id
        FROM film_tag
        GROUP BY film_id
    )
    
    SELECT 
        film.*, 
        studio.name AS studio_name,
        tags
    FROM film
    LEFT JOIN studio USING(studio_id)
    LEFT JOIN tq USING(film_id)
    WHERE studio_id = $1
    `, [studioId]) as (Film & {studio_name: string | null, tags: string | null})[]    
}, "filmsByStudio")