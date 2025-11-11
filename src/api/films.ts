import { and, eq, getTableColumns, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { Film } from "~/datatypes";
import { db } from "~/drizzle/database";
import { actor, actorFilm, film, filmTag, studio } from "~/drizzle/schema";

export type DetailedDbFilm = Awaited<ReturnType<typeof allFilms>>[0]

const tagSubQuery = db
    .$with('tq')
    .as(
        db.select({
            tags: sql`JSON_GROUP_ARRAY(tag)`.as("tags"),
            filmId: filmTag.filmId
        })
            .from(filmTag)
            .groupBy(filmTag.filmId)
    )

const actorSubQuery = db
    .$with('aq')
    .as(
        db.select({
            actors: sql`JSON_GROUP_ARRAY(JSON_OBJECT('actorId', actor.actor_id, 'name', name, 'image', image, 'dob', dob, 'nationality', nationality, 'gender', gender) ORDER BY name)`.as('actors'),
            filmId: actorFilm.filmId
        })
            .from(actorFilm)
            .innerJoin(actor, eq(actorFilm.actorId, actor.actorId))
            .groupBy(actorFilm.filmId)
    )

const filmsQuery = db
    .with(tagSubQuery, actorSubQuery)
    .select({
        ...getTableColumns(film),
        studioName: studio.name,
        tags: sql<string> `coalesce(tags, '[]')`.as("tags"),
        actors: sql<string> `coalesce(actors, '[]')`.as("actors")
    })
    .from(film)
    .leftJoin(studio, eq(studio.studioId, film.studioId))
    .leftJoin(tagSubQuery, eq(tagSubQuery.filmId, film.filmId))
    .leftJoin(actorSubQuery, eq(actorSubQuery.filmId, film.filmId))
    .orderBy(sql`LOWER(title)`)
    .$dynamic()

export function allFilms() {
    return filmsQuery
}

export function filmsByTag(tag: string) {
    const filter = db.select({ filmId: filmTag.filmId }).from(filmTag).where(eq(filmTag.tag, tag))
    return filmsQuery
        .where(inArray(film.filmId, filter))
}

export function filmsByActor(actorId: number) {
    const filter = db.select({ filmId: actorFilm.filmId }).from(actorFilm).where(eq(actorFilm.actorId, actorId))
    return filmsQuery.where(inArray(film.filmId, filter))
}

export function filmsByStudio(studioId: number) {
    return filmsQuery.where(eq(film.studioId, studioId))
}

export async function filmsByPath(path: string) {
    return (await filmsQuery.where(eq(film.path, path))).at(0)
}

export function moviesByCostars(actorAId: number, actorBId: number) {
    const af1 = alias(actorFilm, 'af1')
    const af2 = alias(actorFilm, 'af2')
    const filter = db.select({
        filmId: af1.filmId
    })
    .from(af1)
    .innerJoin(
        af2,
        and(
            eq(af1.filmId, af2.filmId),
            ne(af1.actorId, af2.actorId)
        )
    )
    .where(
        and(
            eq(af1.actorId, actorAId),
            eq(af2.actorId, actorBId)
        )
    )
    return filmsQuery.where(inArray(film.filmId, filter))
}

export function editFilmStudio(filmId: number, studioId: number | null) {
    return db.update(film).set({studioId}).where(eq(film.filmId, filmId))
}

export function updateFilm(f: Partial<Omit<Film, "filmId">>, filmId: number) {
    return db.update(film).set(f).where(eq(film.filmId, filmId))
}

export function addFilms(files: {title: string, path: string}[]) {
    return db.insert(film).values(files).onConflictDoNothing({
        target: film.path
    })
}

export function deleteByPaths(paths: string[]) {
    return db.delete(film).where(inArray(film.path, paths))
}