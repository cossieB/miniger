import { action, json } from "@solidjs/router";
import { Actor, Film, Studio } from "../datatypes";
import { state } from "../state";
import { getActors, getFilms, getFilmsByTag, getInaccessible, getStudios, getTags } from "./data";
import * as tagRepo from "./tags"
import * as actorRepo from "./actors"
import * as studioRepo from "./studios"
import * as filmRepo from "./films"
import { OptionalExcept } from "~/lib/utilityTypes";
import { deleteItemsFromDb } from "./deleteItems";

export const updateTag = action(async (filmId: number, tags: string[]) => {
    try {
        await tagRepo.updateTags(filmId, tags)
        return json(undefined, {revalidate: [getFilms.key, getTags.key, getFilmsByTag.key]})
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: [getFilms.key]})
    }
})

export const addActor = action(async (partialActor: string | Omit<Actor, 'actorId'>, filmId?: number) => {
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

export const updateFilmStudio = action(async (filmId: number, studioId: number | null) => {
    if (studioId === -1)
        studioId = null
    try {
        await filmRepo.editFilmStudio(filmId, studioId)
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const createStudio = action(async (studio: string | Omit<Studio, "studioId">) => {
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

export const editActor = action(async (a: OptionalExcept<Actor, 'actorId'>) => {
    const {actorId, ...rest} = a
    if (Object.keys(rest).length === 0) return;
    try {
        const row = await actorRepo.updateActor(rest, actorId)
        return json(row[0], {revalidate: []})
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const deleteItems = action(async (ids: number[], table: string) => {
    try {
        deleteItemsFromDb(ids, table)
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const editFilmActors = action(async (actors: Actor[], filmId: number) => {

    try {
        actorRepo.editFilmActor(actors, filmId)
        return json(undefined, {revalidate: [getFilms.key]})
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const addDirectoriesToDatabase = action(async (files: {title: string, path: string}[]) => {
    try {
        filmRepo.addFilms(files)
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
        filmRepo.deleteByPaths(selection.map(s => s.path))
        return json(undefined, {revalidate: [getFilms.key, getInaccessible.key]});
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const updateStudio = action(async (s: OptionalExcept<Studio, "studioId">) => {
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

export const editFilm = action(async (f: Partial<Omit<Film, "filmId">>, filmId: number, revalidate: string[] = []) => {

    try {
        filmRepo.updateFilm(f, filmId)    
        return json(undefined, {revalidate})
    } 
    catch (error) {
        state.status.setStatus(String(error))
    }
})