import { createContext, createMemo, createSignal, type Accessor, type JSXElement, type Setter } from "solid-js";
import { createStore } from "solid-js/store";
import { applyFacetedSearch, type FacetResults, type FilterState } from "../utils/faceting";
import { sortMovies, type SortCriterion } from "../utils/sort";
import type { MovieData } from "~/types";
import Fuse from "fuse.js";

export const [movieGridSort, setMovieGridSort] = createSignal<SortCriterion[]>([])
export const [appliedFilters, setAppliedFilters] = createStore<Partial<FilterState>>({})

export const MovieDataContext = createContext<MovieDataContext>()

export function MovieDataProvider(props: { data: MovieData, children: JSXElement }) {
    const [search, setSearch] = createSignal("")

    const results = createMemo(() => applyFacetedSearch(sortMovies(props.data, movieGridSort()), appliedFilters))

    const data = createMemo(() => {
        if (!search()) return results().results;
        if (search().length < 3) return results().results.filter(a => a.title.includes(search()))
        return new Fuse(results().results, {
            keys: ['title'],
        }).search(search()).map(r => r.item)
    })
    const facets = createMemo(() => results().facets)

    return (
        <MovieDataContext.Provider
            value={{
                data,
                facets,
                search,
                setSearch
            }}
        >
            {props.children}
        </MovieDataContext.Provider>
    )
}

export type MovieDataContext = {
    data: () => MovieData,
    facets: () => FacetResults
    setSearch: Setter<string>,
    search: Accessor<string>
}