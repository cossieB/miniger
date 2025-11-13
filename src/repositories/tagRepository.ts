import { db } from "~/kysely/database"

export function allTags() {
    return db.selectFrom("filmTag").select([
        'tag',
        db.fn.countAll<number>().as("films")
    ])
    .groupBy("tag")
    .orderBy("tag", "asc")
    .execute()
}

export function updateTags(filmId: number, tags: string[]) {
    return db.transaction().execute(async (tx) => {
        await tx.deleteFrom("filmTag").where("filmTag.filmId", "=", filmId).execute()
        if (tags.length > 0) 
        await tx.insertInto("filmTag").values(tags.map(tag => ({tag, filmId}))).execute()
    })
}