import { cache } from "@solidjs/router"
import Database from "@tauri-apps/plugin-sql"
import { Film, Studio, Actor, FilmTag, ActorFilm } from "./datatypes"

export const getFilms = cache(async () => {
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
    `) as (Film & {studio_name: string | null, tags: string | null})[]
}, 'films')

export const getStudios = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM studio ORDER BY name ASC") as Studio[]
}, 'studios')

export const getActors = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM actor") as Actor[]
}, 'actors')

export const getFilmTags = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM film_tag") as FilmTag[]
}, 'tags')

export const getActorFilms = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM actor_film") as ActorFilm[]
}, 'appearances')