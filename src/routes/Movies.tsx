import { action, revalidate, useAction } from "@solidjs/router"
import { Suspense, createMemo, createResource } from "solid-js"
import GridTable from "../components/Table"
import { getActorFilms, getFilms } from "../data"
import Database from "@tauri-apps/plugin-sql"
import { MySelectEditor } from "../components/CellEditors/MySelectEditor"
import { Actor } from "../datatypes"
import { ActorSelector, actors } from "../components/CellEditors/ActorCellEditor/ActorSelector"

const updateTag = action(async (filmId: string, tags: string[]) => {
    const db = await Database.load("sqlite:mngr.db");
    try {
        await db.select("BEGIN")
        await db.select("DELETE FROM film_tag WHERE film_id = $1", [filmId])
        for (const tag of tags)
            await db.select("INSERT INTO film_tag (film_id, tag) VALUES ($1, $2)", [filmId, tag.toLowerCase()])
        await db.select("COMMIT")
        await revalidate([])
    }
    catch (error) {
        console.error(error)
        await db.select("ROLLBACK")
    }
}, 'updateTagAction')

export const addActor = action(async (name: string, filmId?: string) => {
    const db = await Database.load("sqlite:mngr.db");
    try {
        await db.select("BEGIN")
        const actor = (await db.select<[Actor]>("INSERT INTO actor (name) VALUES ($1) RETURNING *", [name]))[0];
        if (filmId) {
            await db.select("INSERT INTO actor_film (actor_id, film_id) VALUES ($1, $2) ", [actor.actor_id, filmId])
        }
        await db.select("COMMIT")
        return actor

    } catch (error) {
        console.error(error);
        await db.select("ROLLBACK")
    }
})


export function Movies() {
    const [films] = createResource(async () => getFilms())
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

