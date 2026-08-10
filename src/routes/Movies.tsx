import { createAsync } from "@solidjs/router"
import { createMemo, Match, Show, Switch } from "solid-js"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import type { FfprobeMetadata } from "~/features/movies/utils/updateMetadata"
import { MovieGrid } from "~/features/movies/components/MovieGrid"
import { MoviesTable } from "~/features/movies/components/MoviesTable/MoviesTable"
import { MovieGridProvider } from "~/features/movies/contexts/MovieGridContext"
import { activeView } from "~/layouts/main-window/top-bar/ViewToggle"
import { MyLoader } from "~/components/MyLoader"
import { MovieDataProvider } from "~/features/movies/contexts/MovieDataContext"
import { Portal } from "solid-js/web"
import { FilterWrapper } from "~/features/movies/components/FilterWrapper"
import { SortWrapper } from "~/features/movies/components/SortWrapper"
import styles from "~/features/movies/components/MovieGrid.module.css"

type Props = {
    fetcher(): Promise<DetailedDbFilm[] | undefined>
}

export function Movies(props: Props) {

    const films = createAsync(() => props.fetcher())

    const data = createMemo(() => {
        if (!films.latest) return undefined

        return films.latest!.map((film => ({
            ...film,
            tags: JSON.parse(film.tags as string),
            actors: JSON.parse(film.actors as string),
            metadata: film.metadata ? JSON.parse(film.metadata) as FfprobeMetadata["metadata"] : null
        })))
    })

    return (
        <Show
            when={data()}
            fallback={<MyLoader />}
        >
            <MovieDataProvider data={data()!}>
                <Switch>
                    <Match when={activeView() == "table"}>
                        <MoviesTable />
                    </Match>
                    <Match when={activeView() == "grid"}>
                        <MovieGridProvider >
                            <MovieGrid />
                        </MovieGridProvider>
                    </Match>
                </Switch>
                <Portal>
                    <div
                        popover
                        id="movie-grid-sort"
                        class={`${styles.filters} menuPopoverAnimation`}
                        style={{
                            "position-anchor": "--movie-grid-sort-btn"
                        }}
                    >
                        <SortWrapper />
                        <FilterWrapper />
                    </div>
                </Portal>
            </MovieDataProvider>
        </Show>
    )
}

