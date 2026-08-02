import { useNavigate } from '@solidjs/router';
import { type VirtualItem } from '@tanstack/solid-virtual';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, sep } from '@tauri-apps/api/path';
import { FilmIcon } from 'lucide-solid';
import { batch, createMemo, For, Show, type Accessor } from 'solid-js';
import { BOTTOM_BAR_HEIGHT, CELL_WIDTH, TOP_BAR_HEIGHT } from '~/constants';
import { useGetThumbnails } from '~/features/movies/hooks/useGenerateThumbnails';
import { useMovieGridContext } from '~/features/movies/hooks/useMovieGridContext';
import { state } from '~/state';
import MoviesContextMenu from './MoviesContextMenu';
import styles from "./MovieGrid.module.css"

const dir = await appDataDir()

export function MovieGrid() {
    const { addThumbnail, cacheBuster } = useGetThumbnails()
    const { setParentRef, rowVirtualizer, selections, data, contextMenu } = useMovieGridContext()

    return (
        <div
            ref={elem => {
                setParentRef(elem);
            }}
            id='mg'
            class={`grid-container scrollable ${styles.container}`}
            tabIndex={-1}
            style={{
                height: (state.windowDimensions.height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) + "px",
            }}
            onkeydown={async e => {
                e.preventDefault();
                if (e.repeat) return
                if (e.key === "a" && e.ctrlKey) {
                    return batch(() => {
                        for (let i = 0; i < data().length; i++) {
                            selections.add(i)
                        }
                    })
                }
                if (e.key === "Escape") {
                    contextMenu.close()
                    selections.clear();
                    return
                }
            }}
        >
            {/* Absolute sizer canvas providing the fake scroll height */}
            <div
                style={{
                    height: `${rowVirtualizer().getTotalSize()}px`,
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
            <Show when={contextMenu.isOpen}>
                <MoviesContextMenu
                    contextMenu={contextMenu}
                    isMainPanel
                    getSelectedFilms={() => Array.from(selections).map(i => data()[i])}
                />
            </Show>            
        </div>
    )
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
    const { columns, data, setContextMenu, selections } = useMovieGridContext()
    const startIdx = createMemo(() => props.virtualRow.index * columns());
    const rowItems = createMemo(() => (data().slice(startIdx(), startIdx() + columns())));
    const j = (i: number) => props.virtualRow.index * columns() + i

    return (
        <div
            data-index={props.virtualRow.index}
            // ref={props.rowVirtualizer.measureElement}
            style={{
                transform: `translateY(${props.virtualRow.start}px)`,
                height: props.virtualRow.size + "px"
            }}
            class={styles.row}
        >
            <For each={rowItems()}>

                {(film, i) => (
                    <div
                        class={styles.movieCard}
                        style={{
                            width: CELL_WIDTH + "px",
                            "view-transition-name": `--movieCard${film.filmId}`
                        }}
                        tabIndex={1}
                        classList={{ [styles.selected]: selections.has(j(i())) }}
                        oncontextmenu={(e) => {
                            batch(() => {
                                if (!selections.has(j(i())) && !e.ctrlKey ) {
                                    selections.clear();
                                }
                                selections.add(j(i()));
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
                                if (e.shiftKey) {
                                    const num = Array.from(selections).at(-1) ?? 0;
                                    const [start, end] = [Math.min(num, j(i())), Math.max(num, j(i()))]
                                    for (let idx = start; idx <= end; idx++)
                                        selections.add(idx)
                                    return;
                                }
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
                            navigate("/play?rowId=" + state.sidePanel.list.at(0)?.rowId)
                        }}
                    >
                        <div class={styles.imgWrapper}>
                            <FilmIcon />
                            <img
                                src={convertFileSrc(`${dir}${sep()}thumbs${sep()}${film.filmId}.webp`) + `?=${props.cacheBuster()}`}                                
                                onerror={() => {
                                    props.addThumbnail({ filmId: film.filmId, path: film.path })
                                }}
                                loading='lazy'
                            />
                        </div>
                        <span class={styles.title}>
                                {film.title}
                        </span>
                    </div>
                )}
            </For>

        </div>
    );
}