import { AgGridSolidRef } from "ag-grid-solid";
import { Accessor, createEffect, on } from "solid-js";

/**
 * Fix bug with AG Grid library that sets height of pinned rows to 0
 */
export function fixPinnedRowHeight() {
    document.querySelectorAll<HTMLDivElement>(".ag-floating-bottom, .ag-floating-top").forEach(el => {
        el.style.height = "42px"
        el.style.flexShrink = "0"
    })
}

export function useFilter(ref: Accessor<AgGridSolidRef | undefined>, key: string, accessor: () => string) {
    createEffect(on(accessor, () => {
        ref()?.api.setFilterModel({
            [key]: {
                filterType: "text",
                type: "includes",
                filter: accessor()
            }
        })   
    }))
}