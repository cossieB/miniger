import { action, revalidate } from "@solidjs/router";
import Database from "@tauri-apps/plugin-sql";
import { Actor } from "../datatypes";

export const updateTag = action(async (filmId: string, tags: string[]) => {
    const db = await Database.load("sqlite:mngr.db");
    try {
        await db.select("BEGIN")
        await db.select("DELETE FROM film_tag WHERE film_id = $1", [filmId])
        for (const tag of tags)
            await db.select("INSERT INTO film_tag (film_id, tag) VALUES ($1, $2)", [filmId, tag.toLowerCase()])
        await db.select("COMMIT")
    }
    catch (error) {
        console.error(error)
        await db.select("ROLLBACK")
    }
}, 'updateTagAction')

export const addActor = action(async (name: string, filmId?: string) => {
    const db = await Database.load("sqlite:mngr.db");
    try {
        await db.select("BEGIN")
        const actor = (await db.select<[Actor]>("INSERT INTO actor (name) VALUES ($1) RETURNING *", [name]))[0];
        if (filmId) {
            await db.select("INSERT INTO actor_film (actor_id, film_id) VALUES ($1, $2) ", [actor.actor_id, filmId])
        }
        await db.select("COMMIT")
        return actor

    } catch (error) {
        console.error(error);
        await db.select("ROLLBACK")
    }
})