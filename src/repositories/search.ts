import { sql } from "kysely";
import { db } from "~/kysely/database";
import { filmsQuery } from "./filmsRepository";
import { type Filters } from "~/routes/Search";
import { useNavigate } from "@solidjs/router";

export async function search(p0: any) {
    const navigate = useNavigate()
    const result = sessionStorage.getItem("filters")
    if (!result) return navigate("/search") as never
    const filters: Filters = JSON.parse(result)
    
    let subquery = (function () {
        if (filters.actors.length > 0)
            return db
                .selectFrom("actorFilm")
                .select("actorFilm.filmId as id")
        if (filters.tags.length > 0)
            return db
                .selectFrom("filmTag")
                .select("filmTag.filmId as id")
    })()
    const actorIds = filters.actors.map(a => a.actorId)
    for (let i = 0; i < actorIds.length; i++) {
        const actorId = actorIds[i];
        const alias = "af" + i
        const prev = i == 0 ? [] : actorIds.slice(0, i - 1)
        //@ts-expect-error
        subquery = subquery.innerJoin(sql.raw(`actor_film as ${alias}`), (join: any) =>
            join.onRef("id", "=", sql.raw(`${alias}.film_id`))
                .on(sql.raw(`${alias}.actor_id`), "=", actorId)
                .on(sql.raw(`${alias}.actor_id`), 'not in', prev)
        )
    }
    for (let i = 0; i < filters.tags.length; i++) {
        const tag = filters.tags[i];
        const alias = "ft" + i
        const prev = i == 0 ? [] : filters.tags.slice(0, i - 1)
        //@ts-expect-error
        subquery = subquery.innerJoin(sql.raw(`film_tag as ${alias}`), (join: any) =>
            join.onRef("id", "=", sql.raw(`${alias}.film_id`))
                .on(sql.raw(`${alias}.tag`), "=", tag)
                .on(sql.raw(`${alias}.tag`), 'not in', prev)
        )
    }
    return filmsQuery
        .$if(!!subquery, qb => qb.where("film.filmId", "in", subquery!))
        .$if(!!filters.afterDate, qb => qb.where("film.releaseDate", ">=", filters.afterDate!))
        .$if(!!filters.beforeDate, qb => qb.where("film.releaseDate", "<=", filters.beforeDate!))
        .$if(!!filters.studio.studioId, qb => qb.where("film.studioId", "=", filters.studio.studioId!))
        .execute()
}
