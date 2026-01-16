import { For, Show, Suspense, createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import type { TActor } from "~/datatypes";
import { getActors } from "~/api/data";
import { ActorItem } from "./ActorItem";
import { AddActorToDatabaseBtn } from "./AddActorToDatabaseBtn";
import { createAsync, useAction } from "@solidjs/router";
import clickOutside from "~/lib/clickOutside";
import { editFilmActors } from "~/api/mutations";
import { Portal } from "solid-js/web";
false && clickOutside

let cb: () => TActor[];
export function AgActorSelector(props: ICellEditorParams) {
    const editFilmActorsAction = useAction(editFilmActors);
    const api: ICellEditor = {
        getValue: () => cb(),

    };

    (props as any).ref(api);

    async function handleSubmit(actors: TActor[]) {
        await editFilmActorsAction(actors, props.data.filmId);
        props.stopEditing();
    }

    return (
        <ActorSelector
            allowAddActor
            close={() => props.stopEditing()}
            handleSubmit={handleSubmit}
            initialActors={props.data.actors}
        />
    );
}

type P = {
    close: () => void
    allowAddActor: boolean
    handleSubmit: (actors: TActor[]) => void
    initialActors: TActor[]
}

export function ActorSelector(props: P) {
    const abortController = new AbortController()
    let ref!: HTMLInputElement
    const [input, setInput] = createSignal("");
    const [selectedActors, setSelectedActors] = createSignal(props.initialActors ?? []);
    cb = () => selectedActors()
    const actors = createAsync(() => getActors())
    const filteredActors = () => actors()?.filter(actor => actor.name.toLowerCase().includes(input().toLowerCase()));
    createEffect(on(actors, () => {
        ref?.focus();
    }));
    onMount(() => {
        document.addEventListener("keyup", (e) => {
            if (e.key == "Escape") {
                setSelectedActors(props.initialActors ?? [])
                props.close()
            }
        }, { signal: abortController.signal })
    })
    onCleanup(() => {
        abortController.abort()
    })
    return (
        <Suspense>
            <Portal>
                <div class="fixed inset-0 backdrop-blur-sm z-100">
                    <div
                        class="w-[min(90vw,90rem)] h-screen flex flex-col ml-[50%] -translate-x-[50%]"
                        use:clickOutside={() => {
                            setSelectedActors(props.initialActors ?? [])
                            props.close()
                        }}
                    >
                        <input
                            ref={ref}
                            type="search"
                            value={input()}
                            oninput={e => setInput(e.target.value)}
                            class="ag-text-field-input h-10 shrink-0! grow-0! bg-slate-600!"
                            placeholder="Filter actors"
                        />
                        <button
                            class="flex p-3 w-full items-center justify-center bg-green-600"
                            onclick={() => props.handleSubmit(selectedActors())}
                        >
                            SUBMIT
                        </button>
                        <Show when={selectedActors().length > 0}>
                            <ul class="bg-slate-800 grid text-center p-2 gap-2 overflow-auto max-h-[1/2] shrink-0 grow-0 actorsList">
                                <For each={selectedActors()}>
                                    {actor => <ActorItem actor={actor} rowActors={selectedActors} setRowActors={setSelectedActors} />}
                                </For>
                            </ul>
                            <div class="w-full h-0.5 shrink-0 bg-amber-400" />
                        </Show>
                        <div class="bg-slate-800 overflow-auto grow ">

                            <ul class=" grid text-center p-2 gap-2 actorsList">
                                <For each={filteredActors()}>
                                    {actor => <ActorItem actor={actor} rowActors={selectedActors} setRowActors={setSelectedActors} />}
                                </For>
                            </ul>
                        </div>
                        <Show when={props.allowAddActor}>
                            <AddActorToDatabaseBtn
                                input={input}
                                setRowActors={setSelectedActors}
                                clearInput={() => setInput("")}
                            />
                        </Show>
                    </div>
                </div>
            </Portal>
        </Suspense>
    )
}