import { action, json } from "@solidjs/router";
import { state } from "../state";
import { getActors, getFilms, getInaccessible, getStudios } from "./data";
import * as actorRepo from "../repositories/actorsRepository"
import * as studioRepo from "../repositories/studioRepository"
import * as filmRepo from "../repositories/filmsRepository"
import { type OptionalExcept } from "~/lib/utilityTypes";
import { deleteItemsFromDb } from "../repositories/deleteItems";
import type { TActor, TStudio } from "~/datatypes";

export const addActor = action(async (partialActor: string | Omit<TActor, 'actorId'>, filmId?: number) => {
    const actorObj = typeof partialActor === "string" ? {name: partialActor, dob: null, gender: null, image: null, nationality: null} : partialActor;
    try {
        const a = await actorRepo.createActor(actorObj, filmId)
        return json(a, {revalidate: [getActors.key]})

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
        return json(s, {revalidate: [getStudios.key]})
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

export const addFilesToDatabase = action(async (files: {title: string, path: string}[]) => {
    try {
        const res = await filmRepo.addFilms(files)
        return json(res, {revalidate: [getFilms.key]})
    }
    catch (error) {
        console.log(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const removeByPaths = action(async (selection: { path: string }[] | string[]) => {
    try {
        const array = selection.map(elem => typeof elem == 'string' ? elem : elem.path)
        await filmRepo.deleteByPaths(array)
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
        const studio = await studioRepo.editStudio(rest, studioId)
        return json(studio, {revalidate: [getStudios.key]})
    } catch (error) {
        console.error(error)
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const editFilm = action(async (f: filmRepo.UpdateFilmInput & {filmId: number}, revalidate: string[] = []) => {
    const {filmId, ...rest} = f
    try {
        const film = await filmRepo.updateFilm(filmId, rest)    
        return json(film, {revalidate})
    } 
    catch (error) {
        state.status.setStatus(String(error))
    }
})