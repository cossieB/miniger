import { query } from "@solidjs/router"
import type { Studio, Actor, PairingResult } from "../datatypes"
import { invoke } from "@tauri-apps/api/core"
import { getDatabase } from "./db"
import { allFilms, filmsByActor, filmsByPath, filmsByStudio, filmsByTag, moviesByCostars } from "./films"
import { allActors, allPairings, costarsOf } from "./actors"

export const getFilms = query(async () => {
    return await allFilms()
}, 'films')

export const getStudios = query(async () => {
    await using db = await getDatabase()
    return await db.connection.select<Studio[]>("SELECT * FROM studio ORDER BY LOWER(name) ASC")
}, 'studios')

export const getActors = query(async () => {
    return allActors()
}, 'actors')

export const getInaccessible = query(async () => {
    const films = await allFilms()
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
    return costarsOf(actorId);

}, 'costarsOf')

export const getPairings = query(async () => {
    return allPairings()
}, 'costars')

export const getMoviesByCostars = query(async (actorAId: number, actorBId: number) => {
    return moviesByCostars(actorAId, actorBId);
}, "costarMovies")