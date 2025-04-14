import { action, json } from "@solidjs/router";
import { Actor, Studio } from "../datatypes";
import { state } from "../state";
import { getDatabase } from "./db";
import { getActors, getFilms, getFilmsByTag, getInaccessible, getStudios, getTags } from "./data";

export const updateTag = action(async (filmId: string, tags: string[]) => {
    await using db = await getDatabase();
    try {
        await db.connection.select("BEGIN");
        await db.connection.select("DELETE FROM film_tag WHERE film_id = $1", [filmId])
        for (const tag of tags)
            await db.connection.select("INSERT INTO film_tag (film_id, tag) VALUES ($1, $2)", [filmId, tag.toLowerCase()])
        await db.connection.select("COMMIT")

        return json(undefined, {revalidate: [getFilms.key, getTags.key, getFilmsByTag.key]})
    }
    catch (error) {
        await db.connection.select("ROLLBACK")
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: [getFilms.key]})
    }
})

export const addActor = action(async (actor: string | Omit<Actor, 'actor_id'>, filmId?: string) => {
    await using db = await getDatabase();
    const actorObj: Omit<Actor, 'actor_id'> = typeof actor === "string" ? {name: actor, dob: null, gender: null, image: null, nationality: null} : actor;
    try {
        await db.connection.select("BEGIN")
        const a = (await db.connection.select<[Actor]>(`INSERT INTO actor (name, dob, nationality, gender, image) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [actorObj.name, actorObj.dob, actorObj.nationality, actorObj.gender, actorObj.image]))[0];
        if (filmId) {
            await db.connection.select("INSERT INTO actor_film (actor_id, film_id) VALUES ($1, $2) ", [a.actor_id, filmId])
        }
        await db.connection.select("COMMIT")
        return json(a.actor_id, {revalidate: [getActors.key]})

    } 
    catch (error) {
        console.error(error);
        await db.connection.select("ROLLBACK")
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const updateFilmStudio = action(async (filmId: number, studioId: number | null) => {
    if (studioId === -1)
        studioId = null
    await using db = await getDatabase();
    try {
        await db.connection.select("UPDATE film SET studio_id = $1 WHERE film_id = $2", [studioId, filmId]);
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const createStudio = action(async (studio: string | Studio) => {
    await using db = await getDatabase();
    const studioObj: Omit<Studio, 'studio_id'> = typeof studio === "string" ?  {name: studio, website: null} : studio
    try {
        const s = await db.connection.select("INSERT INTO studio (name, website) VALUES($1,$2) RETURNING *", [studioObj.name, studioObj.website]) as [Studio]
        return json(s[0].studio_id, {revalidate: [getStudios.key]})
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const updateActor = action(async (field: string, value: string, actorId: string) => {
    await using db = await getDatabase();
    try {
        const row = await db.connection.select<Actor[]>(`UPDATE actor SET ${field} = $1 WHERE actor_id = $2 RETURNING *`, [value, actorId])
        return json(row[0], {revalidate: []})
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const deleteItems = action(async (ids: number[], table: string) => {
    await using db = await getDatabase()
    try {
        await db.connection.select("BEGIN")
        for (const id of ids) {
            await db.connection.select(`DELETE FROM ${table} WHERE ${table}_id = $1`, [id])
        }
        await db.connection.select("COMMIT")
    }
    catch (error) {
        await db.connection.select("ROLLBACK")
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const editFilmActors = action(async (actors: Actor[], filmId: string) => {
    await using db = await getDatabase();
    try {
        await db.connection.select("BEGIN");
        await db.connection.select("DELETE FROM actor_film WHERE film_id = $1", [filmId]);
        for (const actor of actors) {
            await db.connection.select("INSERT INTO actor_film (film_id, actor_id) VALUES ($1, $2)", [filmId, actor.actor_id]);
        }
        await db.connection.select("COMMIT");
        return json(undefined, {revalidate: [getFilms.key]})
    }
    catch (error) {
        await db.connection.select("ROLLBACK");
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const addDirectoriesToDatabase = action(async (files: {title: string, path: string}[]) => {
    await using db = await getDatabase()
    try {
        await db.connection.select("BEGIN")
        for (const file of files) {
            await db.connection.select("INSERT INTO film (title, path) VALUES ($1, $2) ON CONFLICT(path) DO NOTHING", [file.title, file.path])
        }
        await db.connection.select("COMMIT")
        return json(undefined, {revalidate: [getFilms.key]})
    }
    catch (error) {
        console.log(error);
        await db.connection.select("ROLLBACK")
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const removeByPaths = action(async (selection: { path: string }[]) => {
    await using db = await getDatabase();
    await db.connection.select("BEGIN");
    try {
        for (const film of selection)
            await db.connection.select("DELETE FROM film WHERE path = $1", [film.path]);
        await db.connection.select("COMMIT");
        return json(undefined, {revalidate: [getFilms.key, getInaccessible.key]});
    }
    catch (error) {
        console.error(error);
        await db.connection.select("ROLLBACK");
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const updateStudio = action(async (field: string, value: string, studioId: number) => {
    await using db = await getDatabase()
    try {
        await db.connection.select(`UPDATE studio SET ${field} = $1 WHERE studio_id = $2`, [value, studioId])
        return json(undefined, {revalidate: [getStudios.key]})
    } catch (error) {
        console.error(error)
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const editFilm = action(async (field: string, value: string, filmId: number, revalidate: string[] = []) => {
    await using db = await getDatabase();

    try {
        await db.connection.select(`UPDATE film SET ${field} = $1 WHERE film_id = $2`, [value, filmId])    
        return json(undefined, {revalidate})
    } 
    catch (error) {
        state.status.setStatus(String(error))
    }
})