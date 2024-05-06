import { action, createAsync, revalidate, useAction } from "@solidjs/router"
import { For, Suspense, createEffect, createResource, onMount } from "solid-js"
import GridTable from "../components/Table"
import { getFilms, getStudios } from "../data"
import type { ICellEditor, ICellEditorParams } from "ag-grid-community"
import Database from "@tauri-apps/plugin-sql"
import { ChangeEvent } from "../lib/solidTypes"

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

const updateStudio = action(async (filmId: number, studioId: number | null) => {
    studioId === -1 && (studioId = null)
    const db = await Database.load("sqlite:mngr.db");
    try {
        await db.select("UPDATE film SET studio_id = $1 WHERE film_id = $2", [studioId, filmId])
        await revalidate([])
    }
    catch (error) {
        console.error(error)
    }
})

const [studios] = createResource(async () => getStudios())

export function Movies() {
    const [films] = createResource(async () => getFilms())
    
    const updateTagAction = useAction(updateTag)
    return (
        <Suspense fallback={<p>Loading Database</p>}>
            <GridTable
                data={films()}
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
                    filter: true,
                }, {
                    field: "release_date",
                    headerName: "Release Date"
                }, {
                    field: "tags",
                    editable: true,
                    onCellValueChanged: async params => {
                        updateTagAction(params.data.film_id, params.newValue.trim().split(/\s*[;,]\s*/))
                    }
                }, {
                    field: "path"
                }]}
            />
        </Suspense>
    )
}

function MySelectEditor(props: ICellEditorParams) {
    const updateStudioAction = useAction(updateStudio)

    let value = props.value;
    let refInput: any;

    const api: ICellEditor = {
        getValue: () => value
    };

    (props as any).ref(api);

    const onValueChanged = async (event: ChangeEvent<HTMLSelectElement>) => {
        const id = Number(event.target.value);
        await updateStudioAction(props.data.film_id, id)
        value = studios()?.find(s => s.studio_id === id)?.name;
        props.stopEditing()
    };
    return (
        <select
            class="w-full h-full"
            ref={refInput}
            onchange={onValueChanged}
            value={props.data.studio_id ?? -1}
        >
            <option disabled>Studios</option>
            <option value="-1">Unknown</option>
            <For each={studios()!}>
                {studio => <option value={studio.studio_id}> {studio.name} </option>}
            </For>
        </select>
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
        value = event.target.value.split(/\s*[;,]\s*/)
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