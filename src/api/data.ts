import { query, redirect } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/core"
import { allFilms, filmsByActor, filmsByPath, filmsByStudio, filmsByTag, moviesByCostars } from "../repositories/filmsRepository"
import { allActors, allPairings, costarsOf } from "../repositories/actorsRepository"
import { allStudios } from "../repositories/studioRepository"
import { allTags } from "../repositories/tagRepository"
import { deco } from "~/utils/encodeDecode"

function getId(str: string, redirectTo: string) {
    const decoded = deco(str); 
    const s = typeof decoded == "string" ? str : decoded.id
    const num = Number(s);
    if (Number.isNaN(num)) throw redirect(redirectTo)
    return num
}

export const getFilms = query(async () => {
    return await allFilms()
}, 'films')

export const getStudios = query(async () => {
    return allStudios()
}, 'studios')

export const getActors = query(async () => {
    return allActors()
}, 'actors')

export const getInaccessible = query(async () => {
    const films = await allFilms()
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string, filmId: number }[]
}, 'inaccessible')

export const getFilmsByTag = query(async (tag: string) => {
    const decoded = decodeURI(tag);
    return await filmsByTag(decoded)
}, 'filmsByTag')

export const getFilmsByActor = query(async (actor: string) => {
    const actorId = getId(actor, "/movies")
    return filmsByActor(actorId)
}, "filmsByActor")

export const getFilmsByStudio = query(async (studio: string) => {
    const studioId = getId(studio, "/movies")
    return filmsByStudio(studioId)
}, "filmsByStudio")

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