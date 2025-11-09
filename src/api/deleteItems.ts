import { inArray } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "~/drizzle/database";
import { actor, film, studio } from "~/drizzle/schema";

export function deleteItemsFromDb(ids: number[], label: string) {
    const [table, id] = getTable(label)
    return db.delete(table).where(inArray(id, ids))
}

function getTable(table: string): [SQLiteTable, SQLiteColumn] {
    switch (table) {
        case "film": return [film, film.filmId]
        case "actor": return [actor, actor.actorId]
        case "studio": return [studio, studio.studioId]
        default: throw new Error("Unhandled table: " + table)
    }
}