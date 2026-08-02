import { action, json, query, revalidate } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/core"
import { type FilmFilters, findFilms, filmsByPath, moviesByCostars } from "~/repositories/filmsRepository"
import { getId } from "~/utils/getIdFromParam"
import * as filmRepo from "~/repositories/filmsRepository"
import { state } from "~/state"

export const getFilms = query(async (filters: FilmFilters = {}) => {
    return await findFilms(filters)
}, 'films')

export const getFilmByPath = query(async (path: string) => {
    return filmsByPath(path)
}, 'filmByPath')

export const getInaccessible = query(async () => {
    const films = await findFilms()
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string, filmId: number }[]
}, 'inaccessible')

export const getMoviesByCostars = query(async (actorA: string, actorB: string) => {
    const actorAId = getId(actorA, "/costars")
    const actorBId = getId(actorB, "/costars")
    return moviesByCostars(actorAId, actorBId);
}, "costarMovies")

export function refetchFilms() {
    return revalidate(getFilms.key)
}

export const editFilm = action(async (f: filmRepo.UpdateFilmInput & { filmId: number }, revalidate: string[] = []) => {
    const { filmId, ...rest } = f
    try {
        const film = await filmRepo.updateFilm(filmId, rest)
        return json(film, { revalidate })
    }
    catch (error) {
        state.status.setStatus(String(error))
    }
})

export const addFilesToDatabase = action(async (files: { title: string, path: string }[]) => {
    try {
        const res = await filmRepo.addFilms(files)
        return json(res, { revalidate: [getFilms.key] })
    }
    catch (error) {
        console.log(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})

export const deleteFilmsByPaths = action(async (selection: { path: string }[] | string[]) => {
    try {
        const array = selection.map(elem => typeof elem == 'string' ? elem : elem.path)
        await filmRepo.deleteByPaths(array)
        return json(undefined, { revalidate: [getFilms.key, getInaccessible.key] });
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})

export const deleteFilmsByIds = action(async (filmIds: number[]) => {
    try {
        await filmRepo.deleteByIds(filmIds)
        return json(undefined, { revalidate: [getFilms.key, getInaccessible.key, getFilmByPath.key] })
    } 
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})