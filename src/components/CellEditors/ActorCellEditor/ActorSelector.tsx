import { For, createResource, createSignal, onMount } from "solid-js";
import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import { Actor } from "../../../datatypes";
import { getActors } from "../../../api/data";
import { ActorItem } from "./ActorItem";
import { SubmitBtn } from "./SubmitBtn";
import { AddActorToDatabaseBtn } from "./AddActorToDatabaseBtn";

export const [actors, { refetch: refetchActors }] = createResource(() => getActors())

export const [addedActors, setAddedActors] = createSignal<Actor[]>([]);

export function ActorSelector(props: ICellEditorParams) {
    let refInput: any;
    const [rowActors, setRowActors] = createSignal<Actor[]>(props.data.actors);
    const api: ICellEditor = {
        getValue: () => rowActors()
    };

    (props as any).ref(api);

    onMount(() => {
        refInput.focus();
    });

    const [input, setInput] = createSignal("");

    return (
        <>
            <input
                ref={refInput}
                type="search"
                value={input()}
                oninput={e => setInput(e.target.value)}
                class="ag-input-field-input ag-text-field-input h-10"
                placeholder="Filter actors"
            />
            <SubmitBtn
                film_id={props.data.film_id}
                rowActors={rowActors}
                stopEditing={props.stopEditing}
            />
            <ul class="bg-slate-800 grid grid-cols-2 text-center p-2 gap-2 max-h-[50vh] overflow-auto w-[33vw] actorsList">
                <For each={actors()?.filter(actor => actor.name.toLowerCase().includes(input().toLowerCase()))}>
                    {actor => <ActorItem actor={actor} rowActors={rowActors} setRowActors={setRowActors} />}
                </For>
                <For each={addedActors()?.filter(actor => actor.name.toLowerCase().includes(input().toLowerCase()))}>
                    {actor => <ActorItem actor={actor} rowActors={rowActors} setRowActors={setRowActors} />}
                </For>
                <AddActorToDatabaseBtn
                    input={input}
                    setRowActors={setRowActors}
                />
            </ul>
        </>
    );
}

