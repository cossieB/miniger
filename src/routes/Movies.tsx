import { createAsync, type AccessorWithLatest } from "@solidjs/router"
import { createMemo, Suspense, createUniqueId, createSignal, Match, Switch } from "solid-js"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import type { FfprobeMetadata } from "~/utils/updateMetadata"
import { MoviesTable } from "~/components/MoviesTable"
import { Grid3x3Icon, ListIcon, LoaderCircleIcon } from "lucide-solid"
import { ModeToggle } from "../components/ModeToggle"
import { MovieGrid } from "~/components/MovieGrid"
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
    const films = createAsync(() => props.fetcher(), { initialValue: [] })

    return (
        <Suspense fallback={<div class="w-full h-full flex items-center justify-center"><LoaderCircleIcon class="animate-spin" size={25} /></div>}>
            <MoviesContent films={films} />
        </Suspense>
    )
}

function MoviesContent(props: { films: AccessorWithLatest<DetailedDbFilm[] | undefined> }) {

    const data = createMemo(() => {
        return props.films()!.map((film) => ({
            ...film,
            tags: JSON.parse(film.tags as string),
            actors: JSON.parse(film.actors as string),
            rowId: createUniqueId(),
            isOnDb: true,
            metadata: film.metadata ? JSON.parse(film.metadata) as FfprobeMetadata["metadata"] : null
        }))
    })

    return (
        <>
            <ModeToggle
                modes={views}
            />
            <Switch>
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