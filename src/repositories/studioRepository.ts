import { sql } from "kysely";
import { db } from "~/kysely/database";
import { type Studio } from "~/kysely/schema";

export function allStudios() {
    return db.selectFrom("studio").selectAll().orderBy(sql`LOWER(name)`).execute();
}

export function findStudioById(id: number) {
    return db.selectFrom("studio").selectAll().where("studioId", "=", id).executeTakeFirstOrThrow()
}

export function addStudio(s: Omit<Studio, 'studioId'>) {
    return db.insertInto("studio").values(s).returningAll().executeTakeFirstOrThrow()
}

export function editStudio(s: Partial<Omit<Studio, "studioId">>, studioId: number) {
    return db.updateTable("studio").set(s).where("studioId", "=", studioId).returningAll().executeTakeFirstOrThrow()
}

export function deleteStudios(studioIds: number[]) {
    return db.deleteFrom("studio").where("studioId", "in", studioIds).execute()
}