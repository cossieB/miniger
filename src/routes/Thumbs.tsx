import { ReactiveSet } from "@solid-primitives/set"
import { action, createAsync, json, useAction } from "@solidjs/router"
import { convertFileSrc, invoke } from "@tauri-apps/api/core"
import { appDataDir, sep } from "@tauri-apps/api/path"
import { confirm } from "@tauri-apps/plugin-dialog"
import { createSignal, For, onCleanup, Show, Suspense } from "solid-js"
import { getFilms } from "~/api/data"

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
    let t = -1

    async function send(films: NewType[]) {
        const confirmed = films.length < 100 || await confirm("This might take a while", {
            kind: "warning"
        })
        if (!confirmed) return;
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
            class="w-full overflow-y-scroll relative overflow-scroll h-screen"
            oncontextmenu={e => e.preventDefault()}
            >
                <div class="flex justify-between h-10 w-full my-2 sticky top-0 bg-slate-800 z-100">
                    <button
                        class="bg-slate-600 p-1"
                        onclick={async () => {
                            await send(films())
                        }}
                        disabled={isWorking()}
                    >
                        Generate thumbs for all {films().length} videos
                    </button>

                    <Show when={selected.size > 0}>
                        <button
                            class="bg-slate-600 p-1"
                            onclick={async () => {
                                const sel: { path: string; filmId: number }[] = []
                                selected.forEach(num => {
                                    sel.push(films()[num])
                                })
                                await send(sel)
                            }}
                            disabled={isWorking()}
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
                </div>
                <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-1">
                    <For each={films()}>
                        {(film, i) =>
                            <div
                                class="flex flex-col bg-gray-800 outline-amber-300"
                                classList={{ "outline-1": selected.has(i()) }}
                                onclick={() => {
                                    if (selected.has(i())) selected.delete(i())
                                    else selected.add(i())
                                }}
                                onauxclick={() => {
                                    send([{ filmId: film.filmId, path: film.path }])
                                }}
                            >
                                <img
                                    class="aspect-video object-cover"
                                    loading="lazy"
                                    src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film.filmId}.jpg`) + `?a=${a()}`}
                                    alt=""
                                    onerror={e => {
                                        e.currentTarget.src = "/Question_Mark.svg"
                                    }} />
                                <label class="overflow-hidden text-nowrap text-center"> {film.title} </label>
                            </div>
                        }
                    </For>

                </div>
            </div>
        </Suspense>
    )
}