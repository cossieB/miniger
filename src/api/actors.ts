import { and, eq, getTableColumns, ne, sql, count, gt } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { Actor } from "~/datatypes";
import { db } from "~/drizzle/database";
import { actor, actorFilm } from "~/drizzle/schema";
import { aliasColumn } from "~/utils/aliasColumn";

export function allActors() {
    return db
        .select({
            ...getTableColumns(actor),
            appearances: count(actor.actorId)
        })
        .from(actor)
        .leftJoin(actorFilm, eq(actorFilm.actorId, actor.actorId))
        .groupBy(actor.actorId)
        .orderBy(sql`LOWER(name)`)
}

export function costarsOf(actorId: number) {
    const actorFilm1 = alias(actorFilm, 'af1')
    const actorFilm2 = alias(actorFilm, 'af2')
    const actor1 = alias(actor, 'a1')
    const actor2 = alias(actor, 'a2')
    return db
        .select({
            actorA: aliasColumn(actor1.name, 'actorA'),
            actorAId: aliasColumn(actor1.actorId, 'actorAId'),
            actorAImage: aliasColumn(actor1.image, 'actorAImage'),
            actorB: aliasColumn(actor2.name, 'actorB'),
            actorBId: aliasColumn(actor2.actorId, 'actorBId'),
            actorBImage: aliasColumn(actor2.image, 'actorBImage'),
            together: count().as("together")
        })
        .from(actorFilm1)
        .innerJoin(actorFilm2, and(
            eq(actorFilm1.filmId, actorFilm2.filmId),
            ne(actorFilm2.actorId, actorId)
        ))
        .innerJoin(actor1, eq(actorFilm1.actorId, actor1.actorId))
        .innerJoin(actor2, eq(actorFilm2.actorId, actor2.actorId))
        .where(eq(actor1.actorId, actorId))
        .groupBy(actor1.actorId, actor2.actorId)
        .orderBy(actor1.name, actor2.name)
}

export function allPairings() {
    const actorFilm1 = alias(actorFilm, 'af1')
    const actorFilm2 = alias(actorFilm, 'af2')
    const actor1 = alias(actor, 'a1')
    const actor2 = alias(actor, 'a2')
    return db
        .select({
            actorA: aliasColumn(actor1.name, 'actorA'),
            actorAId: aliasColumn(actor1.actorId, 'actorAId'),
            actorAImage: aliasColumn(actor1.image, 'actorAImage'),
            actorB: aliasColumn(actor2.name, 'actorB'),
            actorBId: aliasColumn(actor2.actorId, 'actorBId'),
            actorBImage: aliasColumn(actor2.image, 'actorBImage'),
            together: count().as("together")
        })
        .from(actorFilm1)
        .innerJoin(actorFilm2, and(
            eq(actorFilm1.filmId, actorFilm2.filmId),
            gt(actorFilm2.actorId, actorFilm1.actorId)
        ))
        .innerJoin(actor1, eq(actorFilm1.actorId, actor1.actorId))
        .innerJoin(actor2, eq(actorFilm2.actorId, actor2.actorId))
        .groupBy(actor1.actorId, actor2.actorId)
        .orderBy(actor1.name, actor2.name)
}

export function createActor(a: Omit<Actor, 'actorId'>, filmId?: number) {
    
    return db.transaction(async tx => {
        const inserted = (await tx.insert(actor)
            .values(a)
            .returning())[0]

        if (filmId) {
            await tx.insert(actorFilm).values({filmId, actorId: inserted.actorId})
        }
        return inserted
    })
}

export function updateActor(a: Partial<Omit<Actor, "actorId">>, actorId: number) {
    return db.update(actor).set(a).where(eq(actor.actorId, actorId)).returning()
}

export function editFilmActor(actors: Actor[], filmId: number) {
    db.transaction(async tx => {
        await tx.delete(actorFilm).where(eq(actorFilm.filmId, filmId))
        if (actors.length > 0){
            const arr = actors.map(a => ({filmId, actorId: a.actorId}))
            await tx.insert(actorFilm).values(arr)
        }
            
    })
}