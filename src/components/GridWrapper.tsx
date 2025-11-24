import { useMatch, useSearchParams } from "@solidjs/router";
import { GridApi, GridOptions, GridState, Module } from "ag-grid-community";
import AgGridSolid, { AgGridSolidRef } from "ag-grid-solid";
import { createEffect } from "solid-js";
import { state } from "~/state";
import { focusRow } from "~/utils/focusRow";

interface AgGridSolidProps<TData> extends GridOptions<TData> {
    gridOptions?: GridOptions<TData>;
    ref?: AgGridSolidRef | ((ref: AgGridSolidRef) => void);
    modules?: Module[];
    class?: string;
}

type Props<TData = any> = AgGridSolidProps<TData> & {
    additionalSetup?: () => void;
}

const cache: Record<string, GridState> = {}

export function GridWrapper<TData = any>(props: Props<TData>) {
    let gridApi: GridApi
    const [searchParams] = useSearchParams()
    const match = useMatch(() => "/:table/*")

    createEffect(() => {
        if (typeof searchParams.gridId !== "string" || !gridApi) return
        setTimeout(() => focusRow(searchParams.gridId as string, gridApi), 50) // wait for grid to render added rows
    })
    return (
        <AgGridSolid
            onGridReady={params => {
                state.setGridApi(params.api as any);
                gridApi = params.api as any
                props.additionalSetup?.();
                if (typeof searchParams.gridId !== "string") return
                focusRow(searchParams.gridId as string, params.api as any)
            }}
            //@ts-expect-error
            initialState={cache[match()?.params.table]}
            onStateUpdated={e => {
                //@ts-expect-error
                cache[match()?.params.table] = e.api.getState()
            }}
            {...props}
        />
    )
}

