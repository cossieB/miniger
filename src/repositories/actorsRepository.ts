import { sql } from "kysely";
import type { TActor } from "~/datatypes";
import { db } from "~/kysely/database";

export function allActors() {
    return db
        .selectFrom("actor")
        .leftJoin("actorFilm", "actor.actorId", "actorFilm.actorId")
        .selectAll("actor")
        .select(db.fn.count("actorFilm.actorId").as("appearances"))
        .groupBy("actor.actorId")
        .orderBy(sql`LOWER(name)`)
        .execute()
}

export function findById(id: number) {
    return db
        .selectFrom("actor")
        .selectAll()
        .where("actor.actorId", "=", id)
        .executeTakeFirstOrThrow()
}

export function getActorPairings(actorId?: number) {
    let query = db
        .selectFrom("actorFilm as af1")
        .innerJoin("actorFilm as af2", (join) => {
            const baseJoin = join.onRef("af2.filmId", "=", "af1.filmId");
            
            // Apply different join conditions based on whether actorId is provided
            return actorId !== undefined
                ? baseJoin.on("af2.actorId", "!=", actorId)
                : baseJoin.onRef("af2.actorId", ">", "af1.actorId");
        })
        .innerJoin("actor as a", "af1.actorId", "a.actorId")
        .innerJoin("actor as b", "af2.actorId", "b.actorId")
        .select([
            "a.name as actorA",
            "a.actorId as actorAid",
            "b.name as actorB",
            "b.actorId as actorBid",
            db.fn.countAll().as("together")
        ])
        .groupBy(["a.actorId", "b.actorId"])
        .orderBy("a.name", "asc")
        .orderBy("b.name", "asc");

    // Conditionally apply the WHERE clause if we are filtering by a specific actor
    if (actorId !== undefined) {
        query = query.where("af1.actorId", "=", actorId);
    }

    return query.execute();
}

export async function createActor(a: Omit<TActor, 'actorId'>) {
    return await db.insertInto("actor").values(a).returningAll().executeTakeFirstOrThrow();
}

export function updateActor(a: Partial<Omit<TActor, "actorId">>, actorId: number) {
    return db.updateTable("actor").set(a).where("actor.actorId", "=", actorId).returningAll().executeTakeFirstOrThrow();
}

export function deleteActors(actorIds: number[]) {
    return db.deleteFrom("actor").where("actor.actorId", "in", actorIds).execute()
}