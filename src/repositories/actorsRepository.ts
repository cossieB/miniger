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

export function costarsOf(actorId: number) {

    return db
        .selectFrom("actorFilm as af1")
        .innerJoin("actorFilm as af2", join => join
            .onRef("af2.filmId", "=", "af1.filmId")
            .on("af2.actorId", "!=", actorId)
        )
        .innerJoin("actor as a", "af1.actorId", "a.actorId")
        .innerJoin("actor as b", "af2.actorId", "b.actorId")
        .select([
            "a.name as actorA",
            "a.actorId as actorAid",
            "a.image as actorAimage",
            "b.name as actorB",
            "b.actorId as actorBid",
            "b.image as actorBimage",
            db.fn.countAll().as("together")
        ])
        .where("af1.actorId", "=", actorId)
        .groupBy(["a.actorId", "b.actorId"])
        .orderBy("a.name", "asc")
        .orderBy("b.name", "asc")
        .execute();
}

export function allPairings() {

    return db
        .selectFrom("actorFilm as af1")
        .innerJoin("actorFilm as af2", join => join
            .onRef("af2.filmId", "=", "af1.filmId")
            .onRef("af2.actorId", ">", "af1.actorId")
        )
        .innerJoin("actor as a", "af1.actorId", "a.actorId")
        .innerJoin("actor as b", "af2.actorId", "b.actorId")
                .select([
            "a.name as actorA",
            "a.actorId as actorAid",
            "a.image as actorAimage",
            "b.name as actorB",
            "b.actorId as actorBid",
            "b.image as actorBimage",
            db.fn.countAll().as("together")
        ])
        .groupBy(["a.actorId", "b.actorId"])
        .orderBy("a.name", "asc")
        .orderBy("b.name", "asc")
        .execute();
}

export async function createActor(a: Omit<TActor, 'actorId'>, filmId?: number) {

    const inserted = await db.insertInto("actor").values(a).returningAll().executeTakeFirstOrThrow();
    if (filmId) {
        await db.insertInto("actorFilm").values({filmId, actorId: inserted.actorId}).execute();
    }
    return inserted
}

export function updateActor(a: Partial<Omit<TActor, "actorId">>, actorId: number) {
    return db.updateTable("actor").set(a).where("actor.actorId", "=", actorId).execute();
}

export function editFilmActor(actors: TActor[], filmId: number) {
    return db.transaction().execute(async tx => {
        await tx.deleteFrom("actorFilm").where("actorFilm.filmId", "=", filmId).execute();
        if (actors.length > 0) {
            await tx.insertInto("actorFilm").values(actors.map(a => ({filmId, actorId: a.actorId}))).execute();
        }
    })
}