import { useMatch } from "@solidjs/router";
import { GridState } from "ag-grid-community";
import AgGridSolid, { AgGridSolidProps } from "ag-grid-solid";
import { createEffect } from "solid-js";

import { state } from "~/state";

type Props = AgGridSolidProps & {
    additionalSetup?: () => void;
}

const map: Record<string, GridState> = {}

export function GridWrapper(props: Props) {

    const match = useMatch(() => "/:table/*")
    createEffect(() => console.log(match()))

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