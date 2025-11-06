export type Film = {
    film_id: number;
    path: string;
    title: string;
    studio_id: number | null;
    release_date: string | null;
}

export type Actor = {
    actor_id: number;
    name: string;
    dob: string | null;
    nationality: string | null;
    gender: string | null;
    image: string | null;
}

export type Studio = {
    studio_id: number;
    name: string;
    website: string | null;
}

export type ActorFilm = {
    actor_id: number;
    film_id: number;
}

export type FilmTag = {
    film_id: number;
    tag: string;
}

export type DetailedDbFilm = Film & {
    actors: string
    studio_name: string | null
    tags: string
}

export type DetailedFilm = Film & {
    actors: Actor[]
    studio_name: string | null;
    tags: string[]
}

export type PairingResult = {
    actorA: string
    actorAId: number
    actorAImage: string
    actorB: string
    actorBId: number
    together: number
    actorBImage: string
}