import { For, Show, Suspense, createEffect, createSignal, on } from "solid-js";
import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import { Actor } from "../../../datatypes";
import { getActors } from "../../../api/data";
import { ActorItem } from "./ActorItem";
import { SubmitBtn } from "./SubmitBtn";
import { AddActorToDatabaseBtn } from "./AddActorToDatabaseBtn";
import { createAsync } from "@solidjs/router";

export function ActorSelector(props: ICellEditorParams) {
    let refInput!: HTMLInputElement;
    const actors = createAsync(() => getActors())
    const [rowActors, setRowActors] = createSignal<Actor[]>(props.data.actors);
    const api: ICellEditor = {
        getValue: () => rowActors()
    };

    (props as any).ref(api);

    createEffect(on(actors, () => {
        refInput.focus();
    } ) );

    const [input, setInput] = createSignal("");
    const filteredActors = () => actors()?.filter(actor => actor.name.toLowerCase().includes(input().toLowerCase()))
    return (
        <Suspense>
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
            <Show when={rowActors().length > 0}>
            <ul class="bg-slate-800 grid text-center p-2 gap-2 max-h-[75vh] overflow-auto w-[50vw] actorsList">
                <For each={rowActors()}>
                    {actor => <ActorItem actor={actor} rowActors={rowActors} setRowActors={setRowActors} />}
                </For>
            </ul>
            </Show>
            <ul class="bg-slate-800 grid text-center p-2 gap-2 max-h-[75vh] overflow-auto w-[50vw] actorsList">
                <For each={filteredActors()}>
                    {actor => <ActorItem actor={actor} rowActors={rowActors} setRowActors={setRowActors} />}
                </For>
                <AddActorToDatabaseBtn
                    input={input}
                    setRowActors={setRowActors}
                />
            </ul>
        </Suspense>
    );
}

