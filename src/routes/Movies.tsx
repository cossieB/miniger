import { createAsync } from "@solidjs/router"
import { createMemo, Suspense, createUniqueId, createSignal, Show } from "solid-js"
import { type DetailedDbFilm } from "~/repositories/filmsRepository"
import type { FfprobeMetadata } from "~/utils/updateMetadata"
import { MoviesTable } from "~/components/MoviesTable"
import { Grid3x3, List } from "lucide-solid"
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

export function Movies(props: Props) {
    const films = createAsync(() => props.fetcher())
    const [activeView, setActiveView] = createSignal(0)
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
        <>
            <ModeToggle
                modes={views}
                active={activeView()}
                setActive={setActiveView} />
            <Suspense>
                <Show when={activeView() == 0} fallback={<MovieGrid data={data()!} />}>
                    <MoviesTable data={data()!} />
                </Show>
            </Suspense>
        </>
    )
}