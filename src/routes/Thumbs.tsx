import { ReactiveSet } from "@solid-primitives/set"
import { action, createAsync, json, useAction } from "@solidjs/router"
import { convertFileSrc, invoke } from "@tauri-apps/api/core"
import { appDataDir, sep } from "@tauri-apps/api/path"
import { confirm } from "@tauri-apps/plugin-dialog"
import { FilmIcon, LoaderCircle } from "lucide-solid"
import { createSignal, For, onCleanup, Show, Suspense } from "solid-js"
import styles from "~/layouts/secondary-windows/Windows.module.css"
import { CELL_HEIGHT } from "~/constants"
import { getFilms } from "~/features/movies/api"

const dir = await appDataDir()

type NewType = {
    path: string
    filmId: number
}

const genThumb = action(async (videos: NewType[]) => {
    await invoke("generate_thumbnails", { videos })
    return json(undefined, { revalidate: [] })
})

const [a, setA] = createSignal(0) // cache buster

export function Thumbnails() {
    const [isWorking, setIsWorking] = createSignal(false)
    const films = createAsync(() => getFilms(), { initialValue: [] })
    const myAction = useAction(genThumb)
    const selected = new ReactiveSet<number>()
    const errored = new ReactiveSet<number>()
    let t = -1

    async function send(films: NewType[]) {
        const confirmed = films.length < 100 || await confirm("This might take a while", {
            kind: "warning"
        })
        if (!confirmed) return;
        errored.clear()
        setIsWorking(true)
        t = setInterval(() => setA(prev => prev + 1), 5000);
        await myAction(films)
        clearInterval(t)
        setA(prev => prev + 1)
        setIsWorking(false)
    }
    onCleanup(() => clearInterval(t))
    return (
        <Suspense>
            <div
                class={`${styles.thumbs} scrollable`}
                oncontextmenu={e => e.preventDefault()}
            >
                <div class={styles.btns}>
                    <Show when={!isWorking()} fallback={<LoaderCircle class="animate-spin" />}>
                        <button
                            onclick={async () => {
                                await send(films())
                            }}
                        >
                            Generate thumbs for all {films().length} videos
                        </button>
                        <Show when={errored.size > 0}>
                            <button
                                onclick={async () => {
                                    const arr = Array.from(errored).map(i => films()[i])
                                    await send(arr)
                                }}
                            >
                                Generate missing thumbs (≈ {errored.size} videos)
                            </button>
                        </Show>
                        <Show when={selected.size > 0}>
                            <button
                                onclick={async () => {
                                    const sel: { path: string; filmId: number }[] = []
                                    selected.forEach(num => {
                                        sel.push(films()[num])
                                    })
                                    await send(sel)
                                }}
                            >
                                Generate thumbs for {selected.size} selected videos
                            </button>
                            <button
                                class="bg-slate-600 p-1"
                                onclick={() => selected.clear()}
                            >
                                Clear selection
                            </button>
                        </Show>
                    </Show>
                </div>
                <div class={styles.grid}>
                    <For each={films()}>
                        {(film, i) =>
                            <div
                                class={styles.movieCard}
                                classList={{ [styles.selected]: selected.has(i()) }}
                                style={{height: CELL_HEIGHT + "px"}}
                                onclick={() => {
                                    if (selected.has(i())) selected.delete(i())
                                    else selected.add(i())
                                }}
                                onauxclick={() => {
                                    send([{ filmId: film.filmId, path: film.path }])
                                }}
                            >
                                <div class={styles.imgWrapper}>
                                    <FilmIcon />
                                    <img
                                        class="aspect-video object-cover"
                                        src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film.filmId}.webp`) + `?a=${a()}`}
                                        alt=""
                                        onerror={e => {
                                            errored.add(i())
                                        }}
                                    />
                                </div>
                                <span class={styles.title}>
                                    {film.title}
                                </span>
                            </div>
                        }
                    </For>

                </div>
            </div>
        </Suspense>
    )
}