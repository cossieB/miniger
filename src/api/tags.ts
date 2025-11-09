import { count, eq } from "drizzle-orm";
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
    return db.transaction(async tx => {
        await tx.delete(filmTag).where(eq(filmTag.filmId, filmId))
        if (tags.length > 0)
            await tx.insert(filmTag).values(tags.map(tag => ({
                tag: tag.toLowerCase(), 
                filmId
            })))
    })
}