import { ReactiveSet } from "@solid-primitives/set"
import { action, createAsync, json, useAction } from "@solidjs/router"
import { convertFileSrc, invoke } from "@tauri-apps/api/core"
import { appDataDir, sep } from "@tauri-apps/api/path"
import { createResource, For, Show, Suspense } from "solid-js"
import { getFilms } from "~/api/data"

const [dir] = createResource(() => appDataDir())

const genThumb = action(async (videos: { path: string, filmId: number }[]) => {
    await invoke("generate_thumbnails", { videos })
    return json(undefined, { revalidate: [] })
})

export function FfmpegPage() {
    const films = createAsync(() => getFilms(), { initialValue: [] })
    const myAction = useAction(genThumb)
    const selected = new ReactiveSet<number>()
    return (
        <Suspense>
            <div class="h-full overflow-y-scroll">
                <div class="flex justify-between h-10 my-2">
                    <button 
                        class="bg-slate-600 p-1"
                        onclick={async () => {
                            await myAction(films())
                        }}
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
                                await myAction(sel)
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
                </div>
                <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-1">
                    <For each={films()}>
                        {(film, i) =>
                            <div
                                class="flex flex-col bg-gray-800 outline-amber-300"
                                classList={{"outline-1": selected.has(i())}}
                                onclick={() => {
                                    if (selected.has(i())) selected.delete(i())
                                    else selected.add(i())
                                }}
                                onauxclick={() => {
                                    myAction([{ filmId: film.filmId, path: film.path }])
                                }}
                            >
                                <img
                                    class="aspect-video object-cover"
                                    loading="lazy"
                                    src={convertFileSrc(`${dir()}${sep()}thumbs${sep()}${film.filmId}.jpg`)}
                                    alt=""
                                    onerror={e => {
                                        console.log(e.currentTarget.src)
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