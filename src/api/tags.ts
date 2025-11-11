import { count, eq } from "drizzle-orm";
import { AnySQLiteSelectQueryBuilder } from "drizzle-orm/sqlite-core";
import { db } from "~/drizzle/database";
import { filmTag } from "~/drizzle/schema";

export function allTags() {
    return db
        .select({
            tag: filmTag.tag,
            films: count()
        })
        .from(filmTag)
        .groupBy(filmTag.tag)
        .orderBy(filmTag.tag)
}

export function updateTags(filmId: number, tags: string[]) {
    const promises: Promise<unknown>[] = [db.delete(filmTag).where(eq(filmTag.filmId, filmId))]
    if (tags.length > 0) 
        promises.push(db.insert(filmTag).values(tags.map(tag => ({filmId, tag}))))
    return Promise.all(promises)
    // return db.transaction(async tx => {
    //     await tx.delete(filmTag).where(eq(filmTag.filmId, filmId))
    //     if (tags.length > 0)
    //         await tx.insert(filmTag).values(tags.map(tag => ({
    //             tag: tag.toLowerCase(), 
    //             filmId
    //         })))
    // })
}