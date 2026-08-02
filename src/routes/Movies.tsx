import { createAsync } from "@solidjs/router"
import { createMemo, Match, Switch } from "solid-js"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import type { FfprobeMetadata } from "~/features/movies/utils/updateMetadata"
import { LoaderCircleIcon } from "lucide-solid"
import { MovieGrid } from "~/features/movies/components/MovieGrid"
import { MoviesTable } from "~/features/movies/components/MoviesTable/MoviesTable"
import { MovieGridProvider } from "~/features/movies/contexts/MovieGridContext"
import { activeView } from "~/layouts/main-window/top-bar/ViewToggle"

type Props = {
    fetcher(): Promise<DetailedDbFilm[] | undefined>
}

export function Movies(props: Props) {

    const films = createAsync(() => props.fetcher())

    const data = createMemo(() => {
        if (!films()) return undefined

        return films()!.map((film => ({
            ...film,
            tags: JSON.parse(film.tags as string),
            actors: JSON.parse(film.actors as string),
            isOnDb: true,
            metadata: film.metadata ? JSON.parse(film.metadata) as FfprobeMetadata["metadata"] : null
        })))
    })

    return (
        <Switch>
            <Match when={!data()}>
                <div class="flexCenter fillUp">
                    <LoaderCircleIcon class="animate-spin" size={25} />
                </div>
            </Match>
            <Match when={activeView() == "table"}>
                <MoviesTable data={data()!} />
            </Match>
            <Match when={activeView() == "grid"}>
                <MovieGridProvider data={data()!}>
                    <MovieGrid />
                </MovieGridProvider>
            </Match>
        </Switch>
    )
}