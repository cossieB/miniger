import { For } from 'solid-js';
import styles from "./MovieGrid.module.css"
import { SortIcon } from '~/components/tables/SortIcon';
import type { SortCriterion, SortKey } from '../utils/sort';
import titleCase from '~/lib/titleCase';
import { movieGridSort, setMovieGridSort } from '../contexts/MovieGridContext';

const keys = ['title', 'releaseDate', 'path', 'studioName', 'dateAdded', 'duration', 'size', 'bit_rate'] as SortKey[]

export function SortWrapper() {
    return (
        <div
            popover
            id="movie-grid-sort"
            class={`${styles.sortWrapper} menuPopoverAnimation`}
            style={{
                "position-anchor": "--movie-grid-sort-btn"
            }}
        >
            <For each={keys}>
                {key => <Sort key={key} />}
            </For>
        </div>
    )
}

type P2 = {
    key: SortKey
}

function Sort(props: P2) {

    const handleClick = (e: MouseEvent) => {
        const existingSort = movieGridSort().find(x => x.key == props.key)
        if (!existingSort) {
            const sortObj: SortCriterion = { direction: "asc", key: props.key }
            if (e.shiftKey) {
                return setMovieGridSort(prev => [...prev, sortObj])
            }
            return setMovieGridSort([sortObj])
        }
        if (existingSort.direction == "asc") {
            const sortObj: SortCriterion = { direction: "desc", key: props.key }
            if (e.shiftKey) {
                return setMovieGridSort(prev => [...prev.filter(x => x.key != props.key), sortObj])
            }
            return setMovieGridSort([sortObj])
        }
        return setMovieGridSort(prev => prev.filter(s => s.key != props.key))
    }
    return (
        <div class={styles.sortable} onClick={handleClick}>
            <SortIcon sortable direction={movieGridSort().find(x => x.key === props.key)?.direction || false} />
            <label> {titleCase(props.key)} </label>
            <span> {(movieGridSort().findIndex(x => x.key == props.key) + 1) || null} </span>
        </div>
    )
}