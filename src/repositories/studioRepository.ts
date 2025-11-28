import { sql } from "kysely";
import { db } from "~/kysely/database";
import { type Studio } from "~/kysely/schema";

export function allStudios() {
    return db.selectFrom("studio").selectAll().orderBy(sql`LOWER(name)`).execute();
}

export function addStudio(s: Omit<Studio, 'studioId'>) {
    return db.insertInto("studio").values(s).returningAll().execute()
}

export function editStudio(s: Partial<Omit<Studio, "studioId">>, studioId: number) {
    return db.updateTable("studio").set(s).where("studioId", "=", studioId).execute()
}