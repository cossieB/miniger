import { eq } from "drizzle-orm";
import { Studio } from "~/datatypes";
import { db } from "~/drizzle/database";
import { studio } from "~/drizzle/schema";

export function allStudios() {
    return db.query.studio.findMany({
        orderBy(_, operators) {
            return operators.sql`LOWER(name)`
        },
    })
}

export function addStudio(s: Omit<Studio, 'studioId'>) {
    return db.insert(studio).values(s).returning()
}

export function editStudio(s: Partial<Omit<Studio, "studioId">>, studioId: number) {
    return db.update(studio).set(s).where(eq(studio.studioId, studioId))
}