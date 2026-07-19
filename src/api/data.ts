import { query } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/core"
import { filmsByPath, moviesByCostars, findFilms, type FilmFilters } from "../repositories/filmsRepository"
import { allActors, allPairings, costarsOf } from "../repositories/actorsRepository"
import { allStudios } from "../repositories/studioRepository"
import { allTags } from "../repositories/tagRepository"
import { getId } from "~/utils/getIdFromParam"

export const getFilms = query(async (filters: FilmFilters = {}) => {
    return await findFilms(filters)
}, 'films')

export const getStudios = query(async () => {
    return allStudios()
}, 'studios')

export const getActors = query(async () => {
    return allActors()
}, 'actors')

export const getInaccessible = query(async () => {
    const films = await findFilms()
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string, filmId: number }[]
}, 'inaccessible')

export const getFilmByPath = query(async (path: string) => {
    return filmsByPath(path)
}, 'filmByPath')

export const getTags = query(async () => {
    return allTags()
}, 'getTags')

export const getCostars = query(async (actor: string) => {
    const actorId = getId(actor, "/costars")
    return costarsOf(actorId);
}, 'costarsOf')

export const getPairings = query(async () => {
    return allPairings()
}, 'costars')

export const getMoviesByCostars = query(async (actorA: string, actorB: string) => {
    const actorAId = getId(actorA, "/costars")
    const actorBId = getId(actorB, "/costars")
    return moviesByCostars(actorAId, actorBId);
}, "costarMovies")