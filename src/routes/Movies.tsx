import { createAsync } from "@solidjs/router"
import { createMemo, Suspense, createUniqueId, createSignal, Match, Switch } from "solid-js"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import type { FfprobeMetadata } from "~/utils/updateMetadata"
import { MoviesTable } from "~/components/MoviesTable"
import { Grid3x3, List, LoaderCircleIcon } from "lucide-solid"
import { ModeToggle } from "../components/ModeToggle"
import { MovieGrid } from "~/components/MovieGrid"

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

const [activeView, setActiveView] = createSignal(0)

export function Movies(props: Props) {

    const films = createAsync(() => props.fetcher())

    const data = createMemo(() => {
        if (!films()) return undefined
        return films()!.map((film => ({
            ...film,
            tags: JSON.parse(film.tags),
            actors: JSON.parse(film.actors),
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
                    <MovieGrid data={data()!} />
                </Match>
                <Match when={activeView() == 1 && !data()}>
                    <div class="w-full h-full flex items-center justify-center"><LoaderCircleIcon class="animate-spin" size={250} /></div>
                </Match>
            </Switch>
        </Suspense>
    )
}