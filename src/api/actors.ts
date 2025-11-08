import { and, eq, getTableColumns, inArray, ne, sql, count, gt, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "~/drizzle/database";
import { actor, actorFilm, film, filmTag, studio } from "~/drizzle/schema";
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