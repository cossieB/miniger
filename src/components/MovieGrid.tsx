import { createVirtualizer, Virtualizer, type VirtualItem } from '@tanstack/solid-virtual';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, sep } from '@tauri-apps/api/path';
import { createMemo, For } from 'solid-js';
import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from '~/constants';
import { useMovieGridDimensions } from '~/hooks/useMovieGridDimensions';
import { state } from '~/state';
import type { MovieData } from '~/types';

interface GridProps {
    data: MovieData;
}

const dir = await appDataDir()

export function MovieGrid(props: GridProps) {

    let ref!: HTMLDivElement    
    const { columns, setParentRef, cellHeight } = useMovieGridDimensions()
    const rowCount = () => Math.ceil(props.data.length / columns());
    
    const rowVirtualizer = createMemo(() => {        
        return createVirtualizer({
            count: rowCount(),
            getScrollElement: () => ref as HTMLDivElement,
            estimateSize: () => cellHeight, 
            overscan: 5,
            gap: 8,
        })
    });
   
    return (
        <div
            ref={elem => {
                setParentRef(elem);
                ref = elem
            }}
            id='mg'
            class="grid-container scrollbar-gutter-stable"
            style={{
                height: (state.windowDimensions.height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) + "px",  // Required fixed viewport height
                "overflow-y": 'auto', // Required scroll container property
                position: 'relative',
                display: "block",
            }}
        >
            {/* Absolute sizer canvas providing the fake scroll height */}
            <div

                style={{
                    height: `${rowVirtualizer().getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                <For each={rowVirtualizer().getVirtualItems()}>
                    {virtualRow =>
                        <Row
                            virtualRow={virtualRow}
                            data={props.data}
                            rowVirtualizer={rowVirtualizer()}
                            columns={columns()}
                        />
                    }
                </For>

            </div>
        </div>
    );
}

type P = {
    virtualRow: VirtualItem
    data: GridProps['data']
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>
    columns: number
}

function Row(props: P) {
    const { cellWidth } = useMovieGridDimensions()
    const startIdx = () => props.virtualRow.index * props.columns;
    const rowItems = () => props.data.slice(startIdx(), startIdx() + props.columns);

    return (
        <div
            data-index={props.virtualRow.index}
            // ref={props.rowVirtualizer.measureElement}
            style={{
                position: 'absolute',
                transform: `translateY(${props.virtualRow.start}px)`,
                display: "flex",
                height: props.virtualRow.size + "px"
            }}
            class='absolute flex gap-1'
        >
            <For each={rowItems()}>

                {(film) => (
                    <div
                        class='bg-slate-950 text-center flex flex-col'
                        style={{
                            width: cellWidth + "px",
                            // height: cellHeight + "px"
                        }}
                    >
                        <img
                            src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film.filmId}.webp`)} alt=""
                            class="object-cover h-5/6"
                        />
                        <span class='flex-1 truncate'>{film.title} - {film.filmId}</span>
                    </div>
                )}
            </For>
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