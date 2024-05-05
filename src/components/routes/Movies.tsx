import { action, createAsync, useAction } from "@solidjs/router"
import { Suspense, createMemo, onMount } from "solid-js"
import { Actor } from "../../datatypes"
import GridTable from "../Table"
import { getActorFilms, getActors, getFilmTags, getFilms, getStudios } from "../../data"
import { filterMap } from "../../lib/filterMap"
import type { ICellEditor, ICellEditorParams } from "ag-grid-community"
import Database from "@tauri-apps/plugin-sql"

const updateTag = action(async (tags: string[], filmId: string) => {
    const db = await Database.load("sqlite:mngr.db");
    try {
        await db.select("BEGIN")
        await db.select("DELETE FROM film_tag WHERE film_id = $1", [filmId])
        for (const tag of tags)
            await db.select("INSERT INTO film_tag (film_id, tag) VALUES ($1, $2)", [filmId, tag.toLowerCase()])
        await db.select("COMMIT")
    } 
    catch (error) {
        console.error(error)
        await db.select("ROLLBACK")
    }
}, 'updateTagAction')

export function Movies() {
    const films = createAsync(async () => getFilms())
    const actors = createAsync(async () => getActors())
    const studios = createAsync(async () => getStudios())
    const filmTags = createAsync(async () => getFilmTags())
    const actorFilms = createAsync(async () => getActorFilms())

    const map = createMemo(() => {
        const m = new Map<number, Actor>();
        if (!actors()?.length) return m;
        actors()!.forEach(actor => {
            m.set(actor.actor_id, actor)
        })
        return m;
    })

    const data = () => films()?.map(f => ({
        ...f,
        studio: studios()?.find(x => x.studio_id === f.studio_id),
        tags: filterMap(filmTags() ?? [], val => val.film_id == f.film_id, val => val.tag),
        actors: actorFilms()?.filter(x => x.film_id === f.film_id).map(x => map().get(x.actor_id)!)
    }))
    const updateTagAction = useAction(updateTag)
    return (
        <Suspense fallback={<p>Loading Database</p>}>
            <GridTable
                data={data()}
                columnDefs={[{
                    field: 'title',
                    editable: true,
                }, {
                    field: "studio.name",
                    headerName: "Studio"
                }, {
                    field: "actors",
                    editable: true,
                    valueFormatter: (params: any) => {
                        return params.value?.map((x: any) => x.name).join("; ")
                    },
                }, {
                    field: "release_date",
                    headerName: "Release Date"
                }, {
                    field: "tags",
                    editable: true,
                    cellEditor: MyCellEditor,
                    valueFormatter: (params: any) => params.value.join("; "),
                    onCellValueChanged: async params => {
                        updateTagAction(params.newValue, params.data.film_id)
                    }
                }, {
                    field: "path"
                }]}
            />
        </Suspense>
    )
}

function MyCellEditor(props: ICellEditorParams) {
    let value = props.value;
    let refInput: any;

    const api: ICellEditor = {
        getValue: () => value
    };

    (props as any).ref(api);

    const onValueChanged = (event: any) => {
        value = event.target.value.split(/\s*;\s*/)
    };

    onMount(() => {
        refInput.focus();
    })

    return (
        <input
            ref={refInput}
            type="text"
            value={value}
            oninput={onValueChanged}
        />
    )
}