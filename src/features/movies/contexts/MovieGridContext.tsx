import { ReactiveSet } from "@solid-primitives/set";
import { createVirtualizer, Virtualizer } from "@tanstack/solid-virtual";
import { createContext, createMemo, createSignal, type Accessor, type JSXElement, type Setter } from "solid-js";
import { CELL_WIDTH } from "~/constants";
import { useMoviesContextMenu } from "~/features/movies/hooks/useMoviesContextMenu";
import { state } from "~/state";
import type { MovieData } from "~/types";

export const MovieGridContext = createContext<MovieGridContext>()

export function MovieGridProvider(props: { children: JSXElement, data: MovieData }) {
    const selections = new ReactiveSet<number>()
        
    const { contextMenu, setContextMenu } = useMoviesContextMenu()

    const [_parentRef, setParentRef] = createSignal<HTMLDivElement | null>(null);
    const columns = () => Math.floor((state.mainPanel.width() - 50) / CELL_WIDTH)
    const rowCount = createMemo(() => Math.ceil(props.data.length / columns()));

    const rowVirtualizer = createMemo(() => {
        return createVirtualizer({
            count: rowCount(),
            getScrollElement: () => document.getElementById("mg") as HTMLDivElement,
            estimateSize: () => CELL_WIDTH,
            overscan: 5,
            gap: 8,
        })
    });

    return (
        <MovieGridContext.Provider
            value={{
                rowVirtualizer,
                setParentRef,
                contextMenu,
                setContextMenu,
                columns,
                selections,
                data: () => props.data
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
    data: () => MovieData
}