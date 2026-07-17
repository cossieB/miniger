import { revalidate } from "@solidjs/router";
import { getFilms, getFilmsByStudio, getFilmsByActor, getFilmsByTag } from "~/api/data";

export function refetchFilms() {
    return revalidate([getFilms.key, getFilmsByStudio.key, getFilmsByActor.key, getFilmsByTag.key])
}