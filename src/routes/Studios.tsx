import { Suspense, createResource } from "solid-js";
import GridTable from "../components/Table";
import { getStudios } from "../api/data";

export default function Studios() {
    const [actors] = createResource(() => getStudios())

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