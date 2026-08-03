import { createEffect, Match, Switch } from "solid-js"
import { ActorForm } from "~/features/actors/components/ActorForm"
import { state } from "~/state"
import styles from "./Dialog.module.css"

export function Dialog() {
    let ref!: HTMLDialogElement
    createEffect(() => {
        if (state.dialog.active) ref.showModal()
        else ref.close()
    })
    return (
        <dialog ref={ref} class={styles.dialog}>
            <Switch>
                <Match when={state.dialog.active?.type === "actor"}>
                    <ActorForm />
                </Match>
            </Switch>

        </dialog>
    )
}