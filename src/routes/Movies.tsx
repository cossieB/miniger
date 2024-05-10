import { useAction } from "@solidjs/router"
import { Suspense, createMemo, createResource } from "solid-js"
import GridTable from "../components/Table"
import { getActorFilms, getFilms } from "../api/data"
import { MySelectEditor } from "../components/CellEditors/MySelectEditor"
import { Actor } from "../datatypes"
import { ActorSelector, actors } from "../components/CellEditors/ActorCellEditor/ActorSelector"
import { updateTag } from "../api/actions"

export const [films, {refetch: refetchFilms}] = createResource(async () => getFilms())
export function Movies() {
    const [actorsFilms] = createResource(async () => getActorFilms())

    const map = createMemo(() => {
        const m = new Map<number, Actor>()
        if (!actors()) return m;
        for (const actor of actors()!) {
            m.set(actor.actor_id, actor)
        }
        return m
    })

    const data = createMemo(() => {
        if (!films() || !actorsFilms()) return undefined;
        return films()!.map(f => ({
            ...f,
            actors: actorsFilms()!.filter(af => af.film_id === f.film_id).map(af => map().get(af.actor_id)!)
        }))
    })

    const updateTagAction = useAction(updateTag)
    return (
        <Suspense fallback={<p>Loading Database</p>}>
            <GridTable
                rowData={data()}
                columnDefs={[{
                    field: 'title',
                    filter: true,
                    editable: true,
                }, {
                    field: "studio_name",
                    editable: true,
                    headerName: "Studio",
                    cellEditor: MySelectEditor,

                }, {
                    field: "actors",
                    valueFormatter: (params: any) => params.value.map((x: any) => x.name).join(", "),
                    filter: true,
                    editable: true,
                    cellEditor: ActorSelector,
                    cellEditorPopup: true,
                    cellEditorPopupPosition: "under"
                }, {
                    field: "release_date",
                    headerName: "Release Date"
                }, {
                    field: "tags",
                    editable: true,
                    onCellValueChanged: async (params: any) => {
                        updateTagAction(params.data.film_id, params.newValue.trim().split(/\s*[;,]\s*/))
                    }
                }, {
                    field: "path"
                }]}
            />
        </Suspense>
    )
}

