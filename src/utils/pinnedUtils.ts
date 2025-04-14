import { AgGridSolidRef } from "ag-grid-solid";
import { Accessor, createEffect, createSignal, on } from "solid-js";

/**
 * Fix bug with AG Grid library that sets height of pinned rows to 0
 */
export function fixPinnedRowHeight() {
    document.querySelectorAll<HTMLDivElement>(".ag-floating-bottom, .ag-floating-top").forEach(el => {
        el.style.height = "42px"
        el.style.flexShrink = "0"
    })
}

export function useAdded<T>(items: Accessor<T[] | undefined>, id: string & keyof T, ref: Accessor<AgGridSolidRef | undefined>) {
    const [added, setAdded] = createSignal<number>()

    createEffect(() => {    
        if (!added() || !ref()) return
        const idx = items()?.findIndex(a => a[id] === added());
        if (!idx || idx === -1) return;
        ref()?.api.ensureIndexVisible(idx, "middle");
        const node = ref()?.api.getRowNode(added()!.toString())
        if (!node) return
        ref()?.api.setNodesSelected({
            newValue: true,
            nodes: [node]
        })
        setAdded()
    })
    return setAdded
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