import { ReactiveSet } from "@solid-primitives/set";
import { createVirtualizer, Virtualizer } from "@tanstack/solid-virtual";
import { createContext, createMemo, createSignal, type Accessor, type JSXElement, type Setter } from "solid-js";
import { CELL_HEIGHT, CELL_WIDTH } from "~/constants";
import { useMoviesContextMenu } from "~/features/movies/hooks/useMoviesContextMenu";
import { state } from "~/state";
import type { MovieData } from "~/types";
import { type SortCriterion, sortMovies } from "../utils/sort";
import { applyFacetedSearch, type FacetResults, type FilterState } from "../utils/faceting";
import { createStore } from "solid-js/store";
import Fuse from "fuse.js";

export const MovieGridContext = createContext<MovieGridContext>()

export const [movieGridSort, setMovieGridSort] = createSignal<SortCriterion[]>([])
export const [appliedFilters, setAppliedFilters] = createStore<Partial<FilterState>>({})

export function MovieGridProvider(props: { children: JSXElement, data: MovieData }) {
    const selections = new ReactiveSet<number>()

    const { contextMenu, setContextMenu, } = useMoviesContextMenu()

    const [_parentRef, setParentRef] = createSignal<HTMLDivElement | null>(null);
    const columns = () => Math.floor((state.mainPanel.width() - 50) / CELL_WIDTH)
    const [search, setSearch] = createSignal("")
    
    const results = createMemo(() => applyFacetedSearch(sortMovies(props.data, movieGridSort()), appliedFilters))
    
    const data = createMemo(() => {
        if (!search()) return results().results;
        if (search().length < 3) return results().results.filter(a => a.title.includes(search()))
            return new Fuse(results().results, {
        keys: ['title'],
    }).search(search()).map(r => r.item)
})
const rowCount = createMemo(() => Math.ceil(data().length / columns()));

    const rowVirtualizer = createMemo(() => {
        return createVirtualizer({
            count: rowCount(),
            getScrollElement: () => document.getElementById("mg") as HTMLDivElement,
            estimateSize: () => CELL_HEIGHT,
            overscan: 5,
            gap: 8,
        })
    });

    const facets = createMemo(() => results().facets)
    return (
        <MovieGridContext.Provider
            value={{
                rowVirtualizer,
                setParentRef,
                contextMenu,
                setContextMenu,
                columns,
                selections,
                data,
                facets,
                setSearch,
                search
            }}>
            {props.children}
        </MovieGridContext.Provider>
    )
}

export type MovieGridContext = {
    rowVirtualizer: Accessor<Virtualizer<HTMLDivElement, Element>>,
    setParentRef: Setter<HTMLDivElement | null>
    contextMenu: ReturnType<typeof useMoviesContextMenu>['contextMenu']
    setContextMenu: ReturnType<typeof useMoviesContextMenu>['setContextMenu']
    columns: () => number
    selections: ReactiveSet<number>
    data: () => MovieData,
    facets: () => FacetResults
    setSearch: Setter<string>,
    search: Accessor<string>
}