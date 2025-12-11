import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, sep } from "@tauri-apps/api/path";
import { batch, createEffect, For, onMount, Show } from "solid-js";
import type { MovieData, MovieTableData } from "~/types";
import MoviesContextMenu from "./MoviesContextMenu";
import { createStore } from "solid-js/store";
import { ReactiveSet } from "@solid-primitives/set";
import { useNavigate } from "@solidjs/router";
import { state } from "~/state";

const dir = await appDataDir()

type P = {
    data: MovieData
}

function useMoviesContextMenu() {
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        x: 0,
        y: 0,
        close() {
            setContextMenu('isOpen', false)
        },
        data: {} as MovieTableData,
        selections: [] as MovieTableData[]
    })
    return { contextMenu, setContextMenu }
}

export function MovieGrid(props: P) {

    const { contextMenu, setContextMenu } = useMoviesContextMenu()
    const selections = new ReactiveSet<number>()
    const navigate = useNavigate()
    createEffect(() => {
        setContextMenu('selections', Array.from(selections).map(i => props.data[i]).reverse())
        const id = contextMenu.selections.at(0)?.filmId
        const arr = id ? [id] : []
        state.mainPanel.setSelectedIds(arr)
    })
    onMount(() => {
        state.getSelections = () => contextMenu.selections
    })
    return (
        <div class="w-full overflow-y-scroll relative overflow-scroll h-full">
            <div
                class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-1"
            >
                <For each={props.data}>
                    {(film, i) =>
                        <div
                            classList={{ "outline-1": selections.has(i()) }}
                            oncontextmenu={(e) => {
                                batch(() => {
                                    //make sure the right clicked item is the last item in the array
                                    selections.delete(i())
                                    selections.add(i())
                                })
                                setContextMenu({
                                    isOpen: true,
                                    data: film,
                                    x: e.clientX,
                                    y: e.clientY,
                                })
                            }}
                            onclick={(e) => {
                                batch(() => {
                                    if (!e.ctrlKey)
                                        selections.clear()
                                    if (selections.has(i()))
                                        selections.delete(i())
                                    else
                                        selections.add(i())
                                })
                            }}
                            ondblclick={() => {
                                state.sidePanel.setFiles([film])
                                navigate("/play?rowId=" + film.rowId)
                            }}
                            class="flex flex-col bg-gray-800 outline-amber-300"
                        >
                            <img
                                class="aspect-video object-cover"
                                loading="lazy"
                                src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film.filmId}.jpg`)}
                                alt=""
                                onerror={e => {
                                    e.currentTarget.src = "/Question_Mark.svg"
                                }} />
                            <label class="overflow-hidden text-nowrap text-center"> {film.title} </label>
                        </div>
                    }
                </For>
            </div>
            <Show when={contextMenu.isOpen}>
                <MoviesContextMenu
                    contextMenu={contextMenu}
                    isMainPanel
                />
            </Show>
        </div>
    )
}