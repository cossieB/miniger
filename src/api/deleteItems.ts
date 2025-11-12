import { db } from "~/kysely/database"

export async function deleteItemsFromDb(ids: number[], label: string) {console.log(ids, label)
    const [table, id] = getTable(label)
    const deleted = await db.deleteFrom(table).where(id, "in", ids).returningAll().execute()
    console.log(deleted)
    return deleted
}

function getTable(table: string) {
    switch (table) {
        case "film": return [table, "film.filmId"] as const
        case "actor": return [table, "actor.actorId"] as const
        case "studio": return [table, "studio.studioId"] as const
        default: throw new Error("Unhandled table: " + table)
    }
}