import { useMatch } from "@solidjs/router";
import { GridOptions, GridState, Module } from "ag-grid-community";
import AgGridSolid, { AgGridSolidRef } from "ag-grid-solid";
import { state } from "~/state";

interface AgGridSolidProps<TData> extends GridOptions<TData> {
    gridOptions?: GridOptions<TData>;
    ref?: AgGridSolidRef | ((ref: AgGridSolidRef) => void);
    modules?: Module[];
    class?: string;
}

type Props<TData = any> = AgGridSolidProps<TData> & {
    additionalSetup?: () => void;
}

const map: Record<string, GridState> = {}

export function GridWrapper<TData = any>(props: Props<TData>) {

    const match = useMatch(() => "/:table/*")
    
    return (
        <AgGridSolid
            onGridReady={params => {
                state.setGridApi(params.api as any);

                props.additionalSetup?.();
            }}
            //@ts-expect-error
            initialState={map[match()?.params.table]}
            onStateUpdated={e => {
                //@ts-expect-error
                map[match()?.params.table] = e.api.getState()
            }}
            {...props}
        />
    )
}