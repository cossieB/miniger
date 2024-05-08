import { useAction } from "@solidjs/router";
import { Accessor, For, Setter, Show, createResource, createSignal, onMount } from "solid-js";
import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import { CreateActorSvg } from "../icons";
import { Actor } from "../datatypes";
import { addActor } from "../routes/Movies";
import { getActors } from "../data";
import Database from "@tauri-apps/plugin-sql";

export const [actors, { refetch: refetchActors }] = createResource(() => getActors())

export function ActorSelector(props: ICellEditorParams) {
    let value = props.value; console.log(props.data)
    let refInput: any;
    const [addedActors, setAddedActors] = createSignal<Actor[]>([]);
    const [rowActors, setRowActors] = createSignal<Actor[]>(props.data.actors); console.log(rowActors())
    const api: ICellEditor = {
        getValue: () => rowActors()
    };

    (props as any).ref(api);

    onMount(() => {
        refInput.focus();
    });

    const [input, setInput] = createSignal("");
    const addActorAction = useAction(addActor);
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
            <button class="flex h-10 w-full items-center justify-center bg-green-600"
                onclick={async () => {
                    const db = await Database.load("sqlite:mngr.db");
                    try {
                        await db.select("BEGIN")
                        await db.select("DELETE FROM actor_film WHERE film_id = $1", [props.data.film_id]);
                        for (const actor of rowActors()) {
                            await db.select("INSERT INTO actor_film (film_id, actor_id) VALUES ($1, $2)", [props.data.film_id, actor.actor_id])
                        }
                        await db.select("COMMIT");
                        props.stopEditing();
                    }
                    catch (error) {
                        await db.select("ROLLBACK")
                    }
                    props.stopEditing()
                }}
            >
                SUBMIT
            </button>
            <ul class="bg-slate-800 grid grid-cols-2 p-2 gap-2 max-h-[50vh] overflow-auto w-[33vw] actorsList">
                <For each={actors()?.filter(actor => actor.name.toLowerCase().includes(input().toLowerCase()))}>
                    {actor => <ActorItem actor={actor} rowActors={rowActors} setRowActors={setRowActors} />}
                </For>
                <For each={addedActors()?.filter(actor => actor.name.toLowerCase().includes(input().toLowerCase()))}>
                    {actor => <ActorItem actor={actor} rowActors={rowActors} setRowActors={setRowActors} />}
                </For>
                <Show when={input().length > 0}>
                    <button
                        onclick={async () => {
                            const actor = (await addActorAction(input().trim()))[0];
                            setAddedActors(prev => [...prev, actor]);
                        }}
                    >
                        <li class="flex items-center">
                            <CreateActorSvg />
                            Add {input()} to database
                        </li>
                    </button>
                </Show>
            </ul>
        </>
    );
}

type Props = {
    actor: Actor;
    rowActors: Accessor<Actor[]>;
    setRowActors: Setter<Actor[]>
}

function ActorItem(props: Props) {


    function handleClick() {
        if (props.rowActors().some(x => x.actor_id === props.actor.actor_id))
            props.setRowActors(prev => prev.filter(x => x.actor_id !== props.actor.actor_id));
        else
            props.setRowActors(prev => [...prev, props.actor]);
    }
    return <li onclick={handleClick} classList={{ 'text-green-500': props.rowActors().some((x: any) => x.actor_id === props.actor.actor_id) }}> {props.actor.name} </li>
}