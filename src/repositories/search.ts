import { findFilms } from "./filmsRepository";
import { type Filters } from "~/routes/Search";
import { useNavigate } from "@solidjs/router";

export function search() {
    const navigate = useNavigate()
    const result = sessionStorage.getItem("filters")
    if (!result) return navigate("/search") as never
    const filters: Filters = JSON.parse(result)

    return findFilms({
        actorIds: filters.actors.map(a => a.actorId),
        beforeDate: filters.beforeDate,
        afterDate: filters.afterDate,
        studioId: filters.studio.studioId,
        tags: filters.tags as any as string[]
    })
}