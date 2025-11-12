import { TActor } from "../datatypes";

export const filmCache: Record<string, {
    actors: TActor[];
    film_id: number;
    path: string;
    title: string;
    studio_id: number | null;
    release_date: string | null;
    studio_name: string | null;
    tags: string[];
}> = {}