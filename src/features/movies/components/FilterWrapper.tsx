import { For } from "solid-js";
import { useMovieGridContext } from "../hooks/useMovieGridContext"
import styles from "./MovieGrid.module.css"
import { appliedFilters, setAppliedFilters } from "../contexts/MovieGridContext";
import type { FacetResults } from "../utils/faceting";
import titleCase from "~/lib/titleCase";

export function FilterWrapper() {
    return (
        <>
            <Facet
                key="actors"
                filterKey="actorIds"
            />
            <Facet
                key="tags"
                filterKey="tags"
            />
            <Facet
                key="studios"
                filterKey="studioIds"
            />
            <Facet
                key="videoCodecs"
                filterKey="videoCodecs"
            />
        </>
    )
}

type Props<T extends keyof FacetResults> = {
    label?: string
    key: T
    filterKey: T extends "studios" ? "studioIds" : T extends "actors" ? "actorIds" : T
}

function Facet<T extends keyof FacetResults>(props: Props<T>) {
    const { facets } = useMovieGridContext();
    return (
        <div class={`${styles.facet} scrollable`}>
            <h3> {props.label ?? titleCase(props.key)} </h3>
            <For each={facets()[props.key]}>
                {item => (
                    <div

                        // @ts-expect-error
                        classList={{ [styles.active]: appliedFilters[props.filterKey]?.includes(item.id) }}
                        onClick={() => {

                            const arr = appliedFilters[props.filterKey]
                            if (!arr) return setAppliedFilters({
                                [props.filterKey]: [item.id]
                            })
                            // @ts-expect-error
                            if (arr.includes(item.id)) return setAppliedFilters(props.filterKey, arr.filter(t => t !== item.id))
                            // @ts-expect-error
                            return setAppliedFilters(props.filterKey, [...arr, item.id])
                        }}
                    >
                        <label> {'name' in item ? item.name : item.id} </label>
                        <span> {item.count} </span>
                    </div>
                )}
            </For>
        </div>
    )
}