import { Actor, Studio } from "../datatypes";
import { getDatabase } from "./db";

export async function updateTag(filmId: string, tags: string[]) {
    await using db = await getDatabase();
    try {
        await db.connection.select("BEGIN")
        await db.connection.select("DELETE FROM film_tag WHERE film_id = $1", [filmId])
        for (const tag of tags)
            await db.connection.select("INSERT INTO film_tag (film_id, tag) VALUES ($1, $2)", [filmId, tag.toLowerCase()])
        await db.connection.select("COMMIT")
    }
    catch (error) {
        await db.connection.select("ROLLBACK")
        throw error
    }
}

export async function addActor(name: string, filmId?: string) {
    await using db = await getDatabase();
    try {
        await db.connection.select("BEGIN")
        const actor = (await db.connection.select<[Actor]>("INSERT INTO actor (name) VALUES ($1) RETURNING *", [name]))[0];
        if (filmId) {
            await db.connection.select("INSERT INTO actor_film (actor_id, film_id) VALUES ($1, $2) ", [actor.actor_id, filmId])
        }
        await db.connection.select("COMMIT")
        return actor

    } catch (error) {
        console.error(error);
        await db.connection.select("ROLLBACK")
    }
}

export async function updateFilmStudio(filmId: number, studioId: number | null) {
    if (studioId === -1)
        studioId = null
    await using db = await getDatabase();
    try {
        await db.connection.select("UPDATE film SET studio_id = $1 WHERE film_id = $2", [studioId, filmId]);
    }
    catch (error) {
        console.error(error);
    }
}

export async function createStudio(name: string) {
    await using db = await getDatabase();
    try {
        return await db.connection.select("INSERT INTO studio (name) VALUES($1) RETURNING *", [name]) as [Studio]
    } 
    catch (error) {
        
    }
}

export async function updateActor(field: string, value: string, actorId: string) {
    await using db = await getDatabase();
    try {
        await db.connection.select(`UPDATE actor SET ${field} = $1 WHERE actor_id = $2`, [value, actorId])
    } 
    catch (error) {
        console.error(error);
    }
}

export async function deleteItems(ids: number[], table: string) {
    await using db = await getDatabase()
    try {
        await db.connection.select("BEGIN")
        for (const id of ids) {
            await db.connection.select(`DELETE FROM ${table} WHERE ${table}_id = $1`, [id])
        }
        console.log("before commit")
        await db.connection.select("COMMIT")
    } 
    catch (error) {
        await db.connection.select("ROLLBACK")
        throw error
    }
}
