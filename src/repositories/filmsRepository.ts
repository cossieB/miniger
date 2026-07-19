import { sql } from "kysely";
import type { TFilm } from "~/datatypes";
import { db } from "~/kysely/database";

export type DetailedDbFilm = Awaited<ReturnType<typeof findFilms>>[0]

export const filmsQuery = db
    .selectFrom("film")
    .leftJoin("studio", "film.studioId", "studio.studioId")
    .select((eb) => [
        // Base
        "film.filmId",
        "film.title",
        "film.path",
        "film.releaseDate",
        "film.dateAdded",
        "studio.name as studioName",
        "film.studioId",
        "film.metadata",
        
        // Tags
        eb.selectFrom("filmTag")
            .select(sql<string>`COALESCE(JSON_GROUP_ARRAY(tag), '[]')`.as("tags"))
            .whereRef("filmTag.filmId", "=", "film.filmId")
            .as("tags"),

        // Actors
        eb.selectFrom("actorFilm")
            .innerJoin("actor", "actorFilm.actorId", "actor.actorId")
            .select(
                sql<string>`COALESCE(JSON_GROUP_ARRAY(JSON_OBJECT(
                    'actorId', actor.actor_id, 
                    'name', name, 
                    'image', image, 
                    'dob', dob, 
                    'nationality', nationality, 
                    'gender', gender
                ) ORDER BY name), '[]')`.as("actors")
            )
            .whereRef("actorFilm.filmId", "=", "film.filmId")
            .as("actors")
    ])
    .orderBy(sql`LOWER(film.title)`);

export type FilmFilters = {
    actorIds?: number[]
    tags?: string[]
    studioId?: number | null
    afterDate?: string | null;
    beforeDate?: string | null;    
}

export function findFilms(filters: FilmFilters = {}) {
    return filmsQuery
        .$if(!!filters.afterDate, qb => qb.where("film.releaseDate", ">=", filters.afterDate!))
        .$if(!!filters.beforeDate, qb => qb.where("film.releaseDate", "<=", filters.beforeDate!))
        .$if(!!filters.studioId, (qb) => qb.where("film.studioId", "=", filters.studioId!))

        .$if(!!filters.tags?.length, (qb) =>
            qb.where(
                "film.filmId",
                "in",
                db.selectFrom("filmTag")
                    .select("filmTag.filmId")
                    .where("filmTag.tag", "in", filters.tags!)
                    .groupBy("filmTag.filmId")
                    .having(sql`COUNT(DISTINCT tag)`, "=", filters.tags!.length)
            )
        )
        .$if(!!filters.actorIds?.length, (qb) =>
            qb.where(
                "film.filmId",
                "in",
                db.selectFrom("actorFilm")
                    .select("actorFilm.filmId")
                    .where("actorFilm.actorId", "in", filters.actorIds!)
                    .groupBy("actorFilm.filmId")
                    .having(sql`COUNT(DISTINCT actor_id)`, "=", filters.actorIds!.length)
            )
        )
        .execute()
}

export async function filmsByPath(path: string) {
    return filmsQuery.where("film.path", "=", path).executeTakeFirst()
}

export function moviesByCostars(actorAId: number, actorBId: number) {
    const filter = db
        .selectFrom("actorFilm as af1")
        .innerJoin("actorFilm as af2", "af1.filmId", "af2.filmId")
        .select("af1.filmId")
        .where("af1.actorId", "=", actorAId)
        .where("af2.actorId", "=", actorBId)

    return filmsQuery.where("film.filmId", "in", filter).execute()
}

export function updateFilm(f: Partial<Omit<TFilm, "filmId">>, filmId: number) {
    return db.updateTable("film").set(f).where("film.filmId", "=", filmId).execute()
}

export async function addFilms(files: { title: string, path: string }[]) {
    try {
        return db.insertInto("film").values(files).onConflict(oc => oc.column("path").doNothing()).returningAll().execute()
        
    } catch (error) {
        console.error
    }
}

export function deleteByPaths(paths: string[]) {
    return db.deleteFrom("film").where("path", "in", paths).execute()
}

export function getFilmsWithoutMetadata() {
    return db.selectFrom("film").select(["filmId", "path"]).where("metadata", "is", null).execute()
}