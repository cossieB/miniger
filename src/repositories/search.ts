import { useSearchParams } from "@solidjs/router";
import { sql } from "kysely";
import { db } from "~/kysely/database";
import { filmsQuery } from "./filmsRepository";

type Q = {
    actorIds: number[]
    tags: string[],
    beforeDate?: string,
    afterDate?: string
}

export async function search(params: string) {
    const [searchParams] = useSearchParams()
    
    const filters: Q = {
        actorIds: typeof searchParams.actorIds == 'string' ? [Number(searchParams.actorIds)] : searchParams.actorIds?.map(Number) ?? [],
        tags: typeof searchParams.tags == "string" ? [searchParams.tags] : searchParams.tags ?? [],
        beforeDate: typeof searchParams.beforeDate == "string" ? searchParams.beforeDate : undefined,
        afterDate: typeof searchParams.afterDate == "string" ? searchParams.afterDate : undefined
    }

    let query = db
        .selectFrom("actorFilm")
        .select("actorFilm.filmId")

    for (let i = 0; i < filters.actorIds.length; i++) {
        const actorId = filters.actorIds[i];
        const alias = "af" + i
        const prev = i == 0 ? [] : filters.actorIds.slice(0, i-1)
        //@ts-expect-error
        query = query.innerJoin(sql.raw(`actor_film as ${alias}`), (join: any) =>
            join.onRef("actorFilm.filmId", "=", sql.raw(`${alias}.film_id`))
                .on(sql.raw(`${alias}.actor_id`), "=", actorId)
                .on(sql.raw(`${alias}.actor_id`), 'not in', prev)
        )
    }
    for (let i = 0; i < filters.tags.length; i++) {
        const tag = filters.tags[i];
        const alias = "ft" + i
        const prev = i == 0 ? [] : filters.tags.slice(0, i-1)
        //@ts-expect-error
        query = query.innerJoin(sql.raw(`film_tag as ${alias}`), (join: any) =>
            join.onRef("actorFilm.filmId", "=", sql.raw(`${alias}.film_id`))
                .on(sql.raw(`${alias}.tag`), "=", tag)
                .on(sql.raw(`${alias}.tag`), 'not in', prev)
        )
    }
    return filmsQuery
        .where("film.filmId", "in", query)
        .$if(!!filters.afterDate, qb => qb.where("film.releaseDate", ">=", filters.afterDate!))
        .$if(!!filters.beforeDate, qb => qb.where("film.releaseDate", "<=", filters.beforeDate!))
        .execute()
}
