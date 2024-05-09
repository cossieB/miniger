import { action, revalidate, useAction } from "@solidjs/router";
import { For, createResource } from "solid-js";
import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import Database from "@tauri-apps/plugin-sql";
import { ChangeEvent } from "../../lib/solidTypes";
import { getStudios } from "../../data";

const updateStudio = action(async (filmId: number, studioId: number | null) => {
    studioId === -1 && (studioId = null);
    const db = await Database.load("sqlite:mngr.db");
    try {
        await db.select("UPDATE film SET studio_id = $1 WHERE film_id = $2", [studioId, filmId]);
        await revalidate([]);
    }
    catch (error) {
        console.error(error);
    }
});

const [studios] = createResource(async () => getStudios())

export function MySelectEditor(props: ICellEditorParams) {
    const updateStudioAction = useAction(updateStudio);

    let value = props.value;
    let refInput: any;

    const api: ICellEditor = {
        getValue: () => value
    };

    (props as any).ref(api);

    const onValueChanged = async (event: ChangeEvent<HTMLSelectElement>) => {
        const id = Number(event.target.value);
        await updateStudioAction(props.data.film_id, id);
        value = studios()?.find(s => s.studio_id === id)?.name;
        props.stopEditing();
    };
    return (
        <select
            class="w-full h-full bg-slate-800"
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
    );
}
