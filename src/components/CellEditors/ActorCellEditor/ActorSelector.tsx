import { For, Show, Suspense, createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import type { TActor } from "~/datatypes";
import { getActors } from "~/api/data";
import { ActorItem } from "./ActorItem";
import { AddActorToDatabaseBtn } from "./AddActorToDatabaseBtn";
import { createAsync } from "@solidjs/router";
import clickOutside from "~/lib/clickOutside";
import { Portal } from "solid-js/web";
import styles from "./ActorSelector.module.css"

false && clickOutside

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
                <div
                    class={styles.container}
                    onClick={e => e.stopPropagation()}
                >
                    <div                        
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
                            placeholder="Filter actors"
                        />
                        <button
                            onclick={() => props.handleSubmit(selectedActors())}
                        >
                            SUBMIT
                        </button>
                        <Show when={selectedActors().length > 0}>
                            <ul class={`${styles.actorsList} ${styles.cast} scrollable`}>
                                <For each={selectedActors()}>
                                    {actor => <ActorItem actor={actor} rowActors={selectedActors} setRowActors={setSelectedActors} />}
                                </For>
                            </ul>
                            <div />
                        </Show>
                        <div class={`${styles.listContainer} scrollable`}>

                            <ul class={`${styles.actorsList} `}>
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