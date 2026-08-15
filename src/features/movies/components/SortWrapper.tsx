import { For } from 'solid-js';
import styles from "./MovieGrid.module.css"
import { SortIcon } from '~/components/tables/SortIcon';
import type { SortCriterion, SortKey } from '../utils/sort';
import titleCase from '~/lib/titleCase';
import { useMovieDataContext } from '../hooks/useMovieDataContext';
import { movieGridSort, setMovieGridSort } from '../contexts/MovieDataContext';
import { debounce } from '~/lib/debounce';

const keys = ['title', 'releaseDate', 'path', 'studioName', 'dateAdded', 'duration', 'size', 'bit_rate'] as SortKey[]

export function SortWrapper() {
    const { search, setSearch } = useMovieDataContext()
    const debouncedSearch = debounce(setSearch)
    return (
        <div
            class={`${styles.sortWrapper}`}
        >
            <h3>Sort</h3>
            <For each={keys}>
                {key => <Sort key={key} />}
            </For>
            <input
                value={search()}
                onInput={e => {
                    debouncedSearch(e.currentTarget.value)
                }}
                placeholder='Title Search'
                type="text"
            />
        </div>
    )
}

type P2 = {
    key: SortKey
}

function Sort(props: P2) {

    const handleClick = (e: MouseEvent) => {
        const existingSort = movieGridSort().find(x => x.id == props.key)
        if (!existingSort) {
            const sortObj: SortCriterion = { desc: false, id: props.key }
            if (e.shiftKey) {
                return setMovieGridSort(prev => [...prev, sortObj])
            }
            return setMovieGridSort([sortObj])
        }
        if (existingSort.desc === false) {
            const sortObj: SortCriterion = { desc: true, id: props.key }
            if (e.shiftKey) {
                return setMovieGridSort(prev => [...prev.filter(x => x.id != props.key), sortObj])
            }
            return setMovieGridSort([sortObj])
        }
        return setMovieGridSort(prev => prev.filter(s => s.id != props.key))
    }
    return (
        <div class={styles.sortable} onClick={handleClick}>
            <SortIcon sortable desc={movieGridSort().find(x => x.id === props.key)?.desc} />
            <label> {titleCase(props.key)} </label>
            <span> {(movieGridSort().findIndex(x => x.id == props.key) + 1) || null} </span>
        </div>
    )
}