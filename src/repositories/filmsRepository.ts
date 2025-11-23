import { sql } from "kysely";
import { TFilm } from "~/datatypes";
import { db } from "~/kysely/database";


export type DetailedDbFilm = Awaited<ReturnType<typeof allFilms>>[0]

const cte = db
    .with("tq", db => db
        .selectFrom("filmTag")
        .select([
            sql<string>`JSON_GROUP_ARRAY(tag)`.as("tags"),
            'filmId'
        ])
        .groupBy('filmId')
    )
    .with("aq", db => db
        .selectFrom("actorFilm")
        .select([
            sql`JSON_GROUP_ARRAY(JSON_OBJECT('actorId', actor.actor_id, 'name', name, 'image', image, 'dob', dob, 'nationality', nationality, 'gender', gender) ORDER BY name)`.as('actors'),
            "filmId"
        ])
        .innerJoin("actor", "actorFilm.actorId", "actor.actorId")
        .groupBy("filmId")
    )

export const filmsQuery = cte
    .selectFrom("film")
    .leftJoin("studio", "film.studioId", "studio.studioId")
    .leftJoin("tq", "tq.filmId", "film.filmId")
    .leftJoin("aq", "aq.filmId", "film.filmId")
    .selectAll("film")
    .select([
        "studio.name as studioName",
        sql<string>`coalesce(tags, '[]')`.as("tags"),
        sql<string>`coalesce(actors, '[]')`.as("actors")
    ])
    .orderBy(sql`LOWER(title)`)

export function allFilms() {

    return filmsQuery.execute()
}

export function filmsByTag(tag: string) {
    const filter = db.selectFrom("filmTag").select("filmTag.filmId").where("filmTag.tag", "=", tag)
    return filmsQuery.where("film.filmId", "in", filter).execute()
}

export function filmsByActor(actorId: number) {

    const filter = db.selectFrom("actorFilm").select("actorFilm.filmId").where("actorFilm.actorId", "=", actorId)
    return filmsQuery.where("film.filmId", "in", filter).execute()
}

export function filmsByStudio(studioId: number) {
    return filmsQuery.where("film.studioId", "=", studioId).execute()
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
        return db.insertInto("film").values(files).onConflict(oc => oc.column("path").doNothing()).execute()
        
    } catch (error) {
        console.error
    }
}

export function deleteByPaths(paths: string[]) {
    return db.deleteFrom("film").where("path", "in", paths)
}