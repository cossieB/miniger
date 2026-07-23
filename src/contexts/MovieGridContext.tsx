import { ReactiveSet } from "@solid-primitives/set";
import { createVirtualizer, Virtualizer } from "@tanstack/solid-virtual";
import { createContext, createEffect, createMemo, createSignal, type Accessor, type JSXElement, type Setter } from "solid-js";
import { useMoviesContextMenu } from "~/hooks/useMoviesContextMenu";
import { state } from "~/state";
import type { MovieData } from "~/types";

export const MovieGridContext = createContext<MovieGridContext>()

export function MovieGridProvider(props: { children: JSXElement, data: MovieData }) {

    const { contextMenu, setContextMenu } = useMoviesContextMenu()
    const cellHeight = 180
    const cellWidth = cellHeight * 16 / 9;
    const selections = new ReactiveSet<number>()
    const [_parentRef, setParentRef] = createSignal<HTMLDivElement | null>(null);
    const columns = () => Math.floor((state.mainPanel.width() - 30) / cellWidth)

    const rowCount = createMemo(() => Math.ceil(props.data.length / columns()));
    const rowVirtualizer = createMemo(() => {

        return createVirtualizer({
            count: rowCount(),
            getScrollElement: () => document.getElementById("mg") as HTMLDivElement,
            estimateSize: () => cellHeight,
            overscan: 5,
            gap: 8,
        })
    });

    createEffect(() => {
        setContextMenu('selections', Array.from(selections).map(i => props.data[i]).reverse())
        const id = contextMenu.selections.at(0)?.filmId
        const arr = id ? [id] : []
        state.mainPanel.setSelectedIds(arr)
    })

    return (
        <MovieGridContext.Provider
            value={{
                rowVirtualizer,
                setParentRef,
                contextMenu,
                setContextMenu,
                columns,
                cellWidth,
                selections,
                data: props.data
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
    cellWidth: number
    selections: ReactiveSet<number>
    data: MovieData
}