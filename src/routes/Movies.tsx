import { createAsync } from "@solidjs/router"
import { createMemo, createSignal, Match, Switch } from "solid-js"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import type { FfprobeMetadata } from "~/utils/updateMetadata"
import { MoviesTable } from "~/components/MoviesTable/MoviesTable"
import { Grid3x3Icon, ListIcon, LoaderCircleIcon } from "lucide-solid"
import { ModeToggle } from "../components/ModeToggle"
import { MovieGrid } from "~/features/movies/components/MovieGrid"
import { MovieGridProvider } from "~/contexts/MovieGridContext"

type Props = {
    fetcher(): Promise<DetailedDbFilm[] | undefined>
}

const views = [{
    icon: ListIcon,
    label: "table"
}, {
    icon: Grid3x3Icon,
    label: "grid"
}]

export const [activeView, setActiveView] = createSignal(0)

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
        <>
            <ModeToggle
                modes={views}
            />
            <Switch>
                <Match when={!data()}>
                    <div class="flexCenter fillUp">
                        <LoaderCircleIcon class="animate-spin" size={25} />
                    </div>
                </Match>
                <Match when={activeView() == 0}>
                    <MoviesTable data={data()!} />
                </Match>
                <Match when={activeView() == 1}>
                    <MovieGridProvider data={data()!}>
                        <MovieGrid />
                    </MovieGridProvider>
                </Match>
            </Switch>
        </>
    )
}