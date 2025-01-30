import { getFilms } from "../../api/data";
import { Actor, DetailedDbFilm } from "../../datatypes";
import { PlaylistFile } from "../../state";

export async function getFilmCache() {
    const allFilms = await getFilms();
    return allFilms.reduce((acc, film) => {
        acc[film.path] = film;
        return acc;
    }, {} as { [path: string]: DetailedDbFilm; });
}
export function getFilmDetails(fileList: { path: string; title: string; }[], cache: { [path: string]: DetailedDbFilm; }): PlaylistFile[] {
    return fileList.map(file => {
        const film = cache[file.path];
        if (!film)
            return {
                ...file,
                studio_name: "",
                actors: [] as Actor[],
                tags: [] as string[]
            };
        else {
            return {
                ...film,
                tags: JSON.parse(film.tags as any) as string[],
                actors: JSON.parse(film.actors as any) as Actor[],
            };
        }
    })
}

export async function processPlaylist(fileList: { path: string; title: string; }[]) {
    const cache = await getFilmCache();
    return getFilmDetails(fileList, cache);
}