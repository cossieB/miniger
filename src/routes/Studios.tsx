import { Suspense } from "solid-js";
import GridTable from "../components/Table";
import { getStudios } from "../api/data";
import { createAsync } from "@solidjs/router";

export default function Studios() {
    const actors = createAsync(() => getStudios())

    return (
        <Suspense>
            <GridTable
                rowData={actors()}
                defaultColDef={{
                    editable: true,
                    sortable: true,
                }}
                columnDefs={[{
                    field: 'name',
                }, {
                    field: "website"
                }]}

            />
        </Suspense>
    )
}