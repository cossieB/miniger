import { createEffect, Match, Switch } from "solid-js"
import { ActorForm } from "~/features/actors/components/ActorForm"
import { state } from "~/state"
import styles from "./Dialog.module.css"
import { StudioForm } from "~/features/studios/components/StudioForm"
import { MovieForm } from "~/features/movies/components/MovieForm"
import { TagFilm } from "~/features/tmdb/components/TagFilm"

export function Dialog() {
    let ref!: HTMLDialogElement
    createEffect(() => {
        if (state.dialog.active) ref.showModal()
        else ref.close()
    })
    
    return (
        <dialog 
        ref={ref} 
        class={styles.dialog}
        >
            <Switch>
                <Match when={state.dialog.active?.type === "actor"}>
                    <ActorForm />
                </Match>
                <Match when={state.dialog.active?.type === "studio"}>
                    <StudioForm />
                </Match>
                <Match when={state.dialog.active?.type === "film"}>
                    <MovieForm dialog={ref} />
                </Match>
                <Match when={state.dialog.active?.type === "tagFilm"}>
                    <TagFilm dialogRef={ref} />
                </Match>
            </Switch>
        </dialog>
    )
}