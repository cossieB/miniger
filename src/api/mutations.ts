import { action, json } from "@solidjs/router";
import { state } from "../state";
import { getActors, getFilms, getInaccessible, getStudios } from "./data";
import * as tagRepo from "../repositories/tagRepository"
import * as actorRepo from "../repositories/actorsRepository"
import * as studioRepo from "../repositories/studioRepository"
import * as filmRepo from "../repositories/filmsRepository"
import { type OptionalExcept } from "~/lib/utilityTypes";
import { deleteItemsFromDb } from "../repositories/deleteItems";
import type { TActor, TFilm, TStudio } from "~/datatypes";

export const updateTag = action(async (filmId: number, tags: string[]) => {
    try {
        const filterTags: string[] = []
        for (const tag of tags) {
            const trimmed = tag.trim().toLowerCase()
            if (!trimmed || filterTags.includes(trimmed)) continue
            filterTags.push(trimmed)
        }
        
        await tagRepo.updateTags(filmId, filterTags)
        return json(undefined)
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined)
    }
})

export const addActor = action(async (partialActor: string | Omit<TActor, 'actorId'>, filmId?: number) => {
    const actorObj = typeof partialActor === "string" ? {name: partialActor, dob: null, gender: null, image: null, nationality: null} : partialActor;
    try {
        const a = await actorRepo.createActor(actorObj, filmId)
        return json(a.actorId, {revalidate: [getActors.key]})

    } 
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const createStudio = action(async (studio: string | Omit<TStudio, "studioId">) => {
    const studioObj = typeof studio === "string" ?  {name: studio, website: null} : studio
    try {
        const s = await studioRepo.addStudio(studioObj);
        return json(s[0].studioId, {revalidate: [getStudios.key]})
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const editActor = action(async (a: OptionalExcept<TActor, 'actorId'>) => {
    const {actorId, ...rest} = a
    if (Object.keys(rest).length === 0) return;
    try {
        await actorRepo.updateActor(rest, actorId as any as number)
        return json(undefined, {revalidate: []})
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const deleteItems = action(async (ids: number[], table: string) => {
    try {
        await deleteItemsFromDb(ids, table)
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const editFilmActors = action(async (actors: TActor[], filmId: number) => {

    try {
        await actorRepo.editFilmActor(actors, filmId)
        return json(undefined, {revalidate: [getFilms.key]})
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const addDirectoriesToDatabase = action(async (files: {title: string, path: string}[]) => {
    try {
        await filmRepo.addFilms(files)
        return json(undefined, {revalidate: [getFilms.key]})
    }
    catch (error) {
        console.log(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const removeByPaths = action(async (selection: { path: string }[]) => {
    try {
        await filmRepo.deleteByPaths(selection.map(s => s.path))
        return json(undefined, {revalidate: [getFilms.key, getInaccessible.key]});
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const updateStudio = action(async (s: OptionalExcept<TStudio, "studioId">) => {
    const {studioId, ...rest} = s
    try {
        await studioRepo.editStudio(rest, studioId)
        return json(undefined, {revalidate: [getStudios.key]})
    } catch (error) {
        console.error(error)
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const editFilm = action(async (f: OptionalExcept<TFilm, "filmId">, revalidate: string[] = []) => {
    const {filmId, ...rest} = f
    try {
        await filmRepo.updateFilm(rest, filmId)    
        return json(undefined, {revalidate})
    } 
    catch (error) {
        state.status.setStatus(String(error))
    }
})