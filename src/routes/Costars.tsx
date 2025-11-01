import { A, createAsync, useParams } from "@solidjs/router"
import { ICellRendererParams } from "ag-grid-community"
import AgGridSolid from "ag-grid-solid"
import { Suspense } from "solid-js"
import { getCostars } from "~/api/data"

export function Costars() {
    const params = useParams()
    const data = createAsync(() => getCostars(Number(params.actorId)))
    return (
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
                onContextMenu={(e) => {
                    e.preventDefault();
                    return false
                }}
            >
                <AgGridSolid
                    rowData={data()}
                    columnDefs={[{
                        field: "actorA",
                        headerName: "Actor",
                    }, {
                        field: 'actorB',
                        headerName: "Co-Star"
                    }, {
                        field: "together", 
                        headerName: "Movies",
                    }, {
                        field: "",
                        cellRenderer: (params: ICellRendererParams) => <A href={`/movies/actors/${params.data.actorAId}/${params.data.actorBId}?${params.data.actorAId}=${params.data.actorA}&${params.data.actorBId}=${params.data.actorB}`}>View Movies</A>
                    }]}
                />
            </div>
        </Suspense>
    )
}