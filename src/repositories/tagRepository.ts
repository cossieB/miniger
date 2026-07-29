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