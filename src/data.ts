import { cache } from "@solidjs/router"
import Database from "@tauri-apps/plugin-sql"
import { Film, Studio, Actor, FilmTag, ActorFilm } from "./datatypes"

export const getFilms = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM film") as Film[]
}, 'getFilms')

export const getStudios = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM studio") as Studio[]
}, 'getStudios')

export const getActors = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM actor") as Actor[]
}, 'getActors')

export const getFilmTags = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM film_tag") as FilmTag[]
}, 'getTags')

export const getActorFilms = cache(async () => {
    const db = await Database.load("sqlite:mngr.db")
    return await db.select("SELECT * FROM actor_film") as ActorFilm[]
}, 'getAppearances')