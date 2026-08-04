import { action, json, query, revalidate } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/core"
import { getId } from "~/utils/getIdFromParam"
import * as filmRepo from "~/repositories/filmsRepository"
import { state } from "~/state"

export const getFilms = query(async (filters: filmRepo.FilmFilters = {}) => {
    return await filmRepo.findFilms(filters)
}, 'films')

export const getFilm = query(async (filmId: number) => {
    return await filmRepo.findById(filmId)
}, "film")

export const getFilmByPath = query(async (path: string) => {
    return filmRepo.filmsByPath(path)
}, 'filmByPath')

export const getInaccessible = query(async () => {
    const films = await filmRepo.findFilms()
    return await invoke('get_inaccessible', { playlist: films }) as { title: string, path: string, filmId: number }[]
}, 'inaccessible')

export const getMoviesByCostars = query(async (actorA: string, actorB: string) => {
    const actorAId = getId(actorA, "/costars")
    const actorBId = getId(actorB, "/costars")
    return filmRepo.moviesByCostars(actorAId, actorBId);
}, "costarMovies")

export function refetchFilms() {
    return revalidate(getFilms.key)
}

export const editFilm = action(async (f: filmRepo.UpdateFilmInput & { filmId: number }, revalidate: string[] = [getFilm.keyFor(f.filmId), getFilms.key] ) => {
    const { filmId, ...rest } = f
    try {
        const film = await filmRepo.updateFilm(filmId, rest)
        return json(film, { revalidate })
    }
    catch (error) {
        state.status.setStatus(String(error))
    }
})

export const addFilesToDatabase = action(async (files: { title: string, path: string }[], revalidate: string[] = [getFilms.key]) => {
    try {
        const res = await filmRepo.addFilms(files)
        return json(res, { revalidate })
    }
    catch (error) {
        console.log(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})

export const deleteFilmsByPaths = action(async (selection: { path: string }[] | string[], revalidate: string[] = [getFilms.key]) => {
    try {
        const array = selection.map(elem => typeof elem == 'string' ? elem : elem.path)
        await filmRepo.deleteByPaths(array)
        return json(undefined, { revalidate });
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})

export const deleteFilmsByIds = action(async (filmIds: number[], revalidate: string[] = [getFilms.key]) => {
    try {
        await filmRepo.deleteByIds(filmIds)
        return json(undefined, { revalidate })
    } 
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})