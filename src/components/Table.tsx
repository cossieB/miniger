import AgGridSolid, { AgGridSolidProps, AgGridSolidRef } from 'ag-grid-solid';
import { GridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'; // grid core CSS
import "ag-grid-community/styles/ag-theme-alpine.css"; // optional theme
type P<T = any> = {
    data: GridOptions<T>['rowData']
} & AgGridSolidProps

const columnDefaults: AgGridSolidProps['defaultColDef'] = {
    sortable: true
}

export default function GridTable(props: P) {
    let ref: AgGridSolidRef

    return (
        <div class='ag-theme-alpine-dark h-full' >

        <AgGridSolid
            rowData={props.data}
            columnDefs={props.columnDefs}
            class="ag-theme-alpine-dark"
            ref={ref!}
            defaultColDef={columnDefaults}
            animateRows
            />
            </div>
    )
}