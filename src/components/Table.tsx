import AgGridSolid, { AgGridSolidProps, AgGridSolidRef } from 'ag-grid-solid';
import { GridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'; // grid core CSS
import "ag-grid-community/styles/ag-theme-alpine.css"; // optional theme

type P<T = any> = GridOptions<T> & AgGridSolidProps

const columnDefaults: AgGridSolidProps['defaultColDef'] = {
    sortable: true
}

export default function GridTable<T>(props: P<T>) {
    let ref: AgGridSolidRef

    return (
        <div
            id='gridContainer'
            class='ag-theme-alpine-dark h-full relative'
            onContextMenu={(e) => {
                e.preventDefault();
                return false
            }}
          
        >
            <AgGridSolid
                rowData={props.rowData}
                columnDefs={props.columnDefs}
                class="ag-theme-alpine-dark"
                ref={ref!}
                defaultColDef={props.defaultColDef}
                animateRows
            />
        </div>
    )
}