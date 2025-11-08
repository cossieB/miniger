import { query } from "@solidjs/router"
import type { Studio, Actor, PairingResult } from "../datatypes"
import { invoke } from "@tauri-apps/api/core"
import { getDatabase } from "./db"
import { allFilms, filmsByActor, filmsByPath, filmsByStudio, filmsByTag, moviesByCostars } from "./films"

export const getFilms = query(async () => {
    return await allFilms()
}, 'films')

export const getStudios = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<Studio[]>("SELECT * FROM studio ORDER BY LOWER(name) ASC")
}, 'studios')

export const getActors = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<Actor[]>(`
        SELECT *, COUNT(film_id) as appearances FROM actor 
        LEFT JOIN actor_film USING (actor_id)
        GROUP BY actor_id
        ORDER BY LOWER(name)
        `)
}, 'actors')

export const getInaccessible = query(async () => {
    await using db = await getDatabase()
    const films = await db.connection.select("SELECT title, path, film_id FROM film")
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string, film_id: number }[]
}, 'inaccessible')

export const getFilmsByTag = query(async (tag: string) => {
    const decoded = decodeURI(tag);
    return await filmsByTag(decoded)
}, 'filmsByTag')

export const getFilmsByActor = query(async (actorId: number) => {
    return filmsByActor(actorId)
}, "filmsByActor")

export const getFilmsByStudio = query(async (studioId: number) => {
    return filmsByStudio(studioId)
}, "filmsByStudio")

export const getFilmByPath = query(async (path: string) => {
    return filmsByPath(path)
}, 'filmByPath')

export const getTags = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<{ tag: string, count: number }[]>("SELECT tag, COUNT(*) as films FROM film_tag GROUP BY tag ORDER BY tag ASC")
}, 'getTags')

export const getCostars = query(async (actorId: number) => {
    await using db = await getDatabase()
    return await db.connection.select<PairingResult[]>(`
        SELECT 
            a.name actorA, 
            a.actor_id actorAId, 
            a.image actorAImage,
            b.name actorB, 
            b.actor_id actorBId,
            b.image actorBImage, 
            COUNT(*) as together
        FROM actor_film af1
        JOIN actor_film af2 ON af1.film_id = af2.film_id AND af2.actor_id > $1
        JOIN actor a ON a.actor_id = af1.actor_id
        JOIN actor b ON b.actor_id = af2.actor_id
        WHERE af1.actor_id = $1
        GROUP BY a.actor_id, b.actor_id
        ORDER BY a.name, b.name
        `, [actorId])
}, 'costarsOf')

export const getPairings = query(async () => {
    await using db = await getDatabase()

    return await db.connection.select<PairingResult[]>(`
        SELECT 
            a.name actorA, 
            a.actor_id actorAId, 
            a.image actorAImage,
            b.name actorB, 
            b.actor_id actorBId,
            b.image actorBImage, 
            COUNT(*) as together
        FROM actor_film af1
        JOIN actor_film af2 ON af1.film_id = af2.film_id
        JOIN actor a ON a.actor_id = af1.actor_id
        JOIN actor b ON b.actor_id = af2.actor_id
        WHERE a.actor_id < b.actor_id
        GROUP BY a.actor_id, b.actor_id
        ORDER BY together DESC
        `)
}, 'costars')

export const getMoviesByCostars = query(async (actorAId: number, actorBId: number) => {
    return moviesByCostars(actorAId, actorBId);
}, "costarMovies")