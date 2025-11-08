import { InferSelectModel } from "drizzle-orm";
import { actor, actorFilm, film, filmTag, studio } from "./drizzle/schema";

export type Film = InferSelectModel<typeof film>
export type Actor = InferSelectModel<typeof actor>
export type Studio = InferSelectModel<typeof studio>
export type ActorFilm = InferSelectModel<typeof actorFilm>
export type FilmTag = InferSelectModel<typeof filmTag>

type DetailedDbFilm = Film & {
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