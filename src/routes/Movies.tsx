import { createAsync } from "@solidjs/router"
import { createMemo, Suspense, createUniqueId, createSignal, Match, Switch } from "solid-js"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import type { FfprobeMetadata } from "~/utils/updateMetadata"
import { MoviesTable } from "~/components/MoviesTable"
import { Grid3x3, List, LoaderCircleIcon } from "lucide-solid"
import { ModeToggle } from "../components/ModeToggle"
import { MovieGrid } from "~/components/MovieGrid"
import { MovieGridProvider } from "~/contexts/MovieGridContext"

type Props = {
    fetcher(): Promise<DetailedDbFilm[] | undefined>
}

const views = [{
    icon: <List />,
    id: "table"
}, {
    icon: <Grid3x3 />,
    id: "grid"
}]

const [activeView, setActiveView] = createSignal(1)

export function Movies(props: Props) {

    const films = createAsync(() => props.fetcher())

    const data = createMemo(() => {
        if (!films()) return undefined

        return films()!.map((film => ({
            ...film,
            tags: JSON.parse(film.tags as string),
            actors: JSON.parse(film.actors as string),
            rowId: createUniqueId(),
            isOnDb: true,
            metadata: film.metadata ? JSON.parse(film.metadata) as FfprobeMetadata["metadata"] : null
        })))
    })

    return (
        <Suspense>
            <ModeToggle
                modes={views}
                active={activeView()}
                setActive={setActiveView}
            />
            <Switch>
                <Match when={activeView() == 0}>
                    <MoviesTable data={data()!} />
                </Match>
                <Match when={activeView() == 1 && data()}>
                    <MovieGridProvider data={data()!}>
                        <MovieGrid />
                    </MovieGridProvider>
                </Match>
                <Match when={activeView() == 1 && !data()}>
                    <div class="w-full h-full flex items-center justify-center"><LoaderCircleIcon class="animate-spin" size={25} /></div>
                </Match>
            </Switch>
        </Suspense>
    )
}