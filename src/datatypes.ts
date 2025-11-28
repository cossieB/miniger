import { type Generated } from "kysely";
import type { Actor, ActorFilm, Film, FilmTag, Studio } from "./kysely/schema";

type KyselyToClient<T> = {
    [K in keyof T]: T[K] extends Generated<infer X> ? X : T[K]
}

export type TFilm = KyselyToClient<Film>
export type TStudio = KyselyToClient<Studio>
export type TActor = KyselyToClient<Actor>
export type TACtorFilm = KyselyToClient<ActorFilm>
export type TFilmTag = KyselyToClient<FilmTag>