import { Suspense, createResource } from "solid-js";
import GridTable from "../components/Table";
import { getActors } from "../api/data";
import {countryList} from "../countryList";

export default function Actors() {
    const [actors] = createResource(() => getActors())

    return (
        <Suspense>
            <GridTable
                rowData={actors()}

                columnDefs={[{
                    field: 'name',
                    editable: true,
                }, {
                    field: 'gender',
                    filter: true,
                    editable: true,
                    cellEditor: 'agSelectCellEditor',
                    cellEditorParams: {
                        values: ["M", "F"]
                    }

                }, {
                    field: 'dob',
                    cellEditor: "agDateStringCellEditor",
                    editable: true,
                }, {
                    field: 'nationality',
                    editable: true,
                    filter: true,
                    cellEditor: 'agSelectCellEditor',
                    cellEditorParams: {
                        values: countryList
                    }
                }, {
                    field: 'image'
                }]}

            />
        </Suspense>
    )
}