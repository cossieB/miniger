import { For } from "solid-js";
import { useMovieGridContext } from "../hooks/useMovieGridContext"
import styles from "./MovieGrid.module.css"
import { appliedFilters, setAppliedFilters } from "../contexts/MovieGridContext";
import type { FacetResults, FilterState } from "../utils/faceting";
import titleCase from "~/lib/titleCase";

export function FilterWrapper() {
    return (
        <>
            <Facet
                key="actors"
            />
            <Facet
                key="tags"
            />
            <Facet
                key="studios"
            />
            <Facet
                key="videoCodecs"
            />
        </>
    )
}

type Props<T extends keyof FacetResults> = {
    label?: string
    key: T
}

function Facet<T extends keyof FacetResults>(props: Props<T>) {
    const { facets } = useMovieGridContext();
    const filterKey: keyof FilterState = props.key == "actors" ? "actorIds" : props.key == "studios" ? "studioIds" : props.key
    return (
        <div class={`${styles.facet} scrollable`}>
            <h3> {props.label ?? titleCase(props.key)} </h3>
            <For each={facets()[props.key]}>
                {item => (
                    <div

                        // @ts-expect-error
                        classList={{ [styles.active]: appliedFilters[filterKey]?.includes(item.id) }}
                        onClick={() => {

                            const arr = appliedFilters[filterKey]
                            if (!arr) return setAppliedFilters({
                                [filterKey]: [item.id]
                            })
                            // @ts-expect-error
                            if (arr.includes(item.id)) return setAppliedFilters(filterKey, arr.filter(t => t !== item.id))
                            // @ts-expect-error
                            return setAppliedFilters(filterKey, [...arr, item.id])
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