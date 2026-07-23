import { useNavigate } from '@solidjs/router';
import { type VirtualItem } from '@tanstack/solid-virtual';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, sep } from '@tauri-apps/api/path';
import { FilmIcon } from 'lucide-solid';
import { batch, createMemo, For, Show, type Accessor } from 'solid-js';
import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from '~/constants';
import { useGetThumbnails } from '~/hooks/useGenerateThumbnails';
import { useMovieGridContext } from '~/hooks/useMovieGridContext';
import { state } from '~/state';
import type { MovieData } from '~/types';
import MoviesContextMenu from './MoviesContextMenu';

interface GridProps {
    data: MovieData;
}

const dir = await appDataDir()

export function MovieGrid(props: GridProps) {
    const { addThumbnail, cacheBuster } = useGetThumbnails()
    let ref!: HTMLDivElement
    const { setParentRef, rowVirtualizer } = useMovieGridContext()

    return (
        <div
            ref={elem => {
                setParentRef(elem);
                ref = elem
            }}
            id='mg'
            class="grid-container"
            style={{
                height: (state.windowDimensions.height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) + "px",
                "overflow-y": 'auto',
                position: 'relative',
                display: "block",
            }}
        >
            {/* Absolute sizer canvas providing the fake scroll height */}
            <div

                style={{
                    height: `${rowVirtualizer().getTotalSize()}px`,
                    position: 'relative',

                }}
            >
                <For each={rowVirtualizer().getVirtualItems()}>
                    {virtualRow =>
                        <Row
                            virtualRow={virtualRow}
                            addThumbnail={addThumbnail}
                            cacheBuster={cacheBuster}
                        />
                    }
                </For>

            </div>
        </div>
    );
}

type P = {
    virtualRow: VirtualItem
    cacheBuster: Accessor<number>
    addThumbnail: (video: {
        filmId: number
        path: string
    }) => void
}

function Row(props: P) {
    const navigate = useNavigate()
    const { cellWidth, columns, data } = useMovieGridContext()
    const startIdx = createMemo(() => props.virtualRow.index * columns());
    const rowItems = createMemo(() => (data.slice(startIdx(), startIdx() + columns())));
    const { setContextMenu, selections, contextMenu } = useMovieGridContext()
    const j = (i: number) => props.virtualRow.index * columns() + i

    return (
        <div
            data-index={props.virtualRow.index}
            // ref={props.rowVirtualizer.measureElement}
            style={{
                transform: `translateY(${props.virtualRow.start}px)`,
                height: props.virtualRow.size + "px"
            }}
            class='absolute flex gap-1'
        >
            <For each={rowItems()}>

                {(film, i) => (
                    <div
                        class='text-center flex flex-col bg-slate-800 flex-1'
                        style={{
                            width: cellWidth + "px"
                        }}
                        classList={{ "outline-1": selections.has(j(i())) }}
                        oncontextmenu={(e) => {
                            batch(() => {
                                //make sure the right clicked item is the last item in the array
                                selections.delete(j(i()))
                                selections.add(j(i()))
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
                                if (selections.has(j(i())))
                                    selections.delete(j(i()))
                                else
                                    selections.add(j(i()))
                            })
                        }}
                        ondblclick={() => {
                            state.sidePanel.setFiles([film])
                            navigate("/play?rowId=" + film.rowId)
                        }}
                    >
                        <div class='h-5/6 w-full relative'>
                            <FilmIcon
                                class='w-full h-1/2 top-1/2 -translate-y-1/2 absolute z-1'
                            />
                            <img
                                src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film.filmId}.webp`) + `?=${props.cacheBuster()}`}
                                class="object-cover w-full h-full z-2 relative"
                                onerror={e => {
                                    props.addThumbnail({ filmId: film.filmId, path: film.path })
                                }}
                            />
                        </div>
                        <div class='flex-1 flex items-center px-2'>
                            <span class='truncate text-ellipsis w-full text-nowrap'>
                                {film.title}
                            </span>
                        </div>
                    </div>
                )}
            </For>
            <Show when={contextMenu.isOpen}>
                <MoviesContextMenu
                    contextMenu={contextMenu}
                    isMainPanel
                />
            </Show>
        </div>
    );
}

/**
 export function MovieGrid(props: P) {
    const {addThumbnail, cacheBuster} = useGetThumbnails()
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
        <div class="w-full overflow-y-scroll relative overflow-scroll h-full" style={{ "content-visibility": "auto" }}>
            <div
                class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-1"
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
                                src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film.filmId}.webp`) + `?=${cacheBuster()}`}
                                alt=""
                                onerror={e => {
                                    addThumbnail({filmId: film.filmId, path: film.path})
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


 */