import { Setter, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { state } from "~/state"

type Props<T> = {
    input: T
    key: string & keyof T
    addAction: (...params: any[]) => Promise<number>
    reset: () => void
    setAdded: Setter<number | undefined>
}

export function PinnedRowButtons<T>(props: Props<T>) {
    return (
        <Show when={props.input[props.key]} >
        <Portal mount={document.querySelector('section')!} >
            <div class="z-999 absolute bottom-0 w-full h-10 text-white flex">
                <button
                    class="bg-orange-600 rounded-lg flex-1"
                    style={{ width: state.sidePanel.width + "px" }}
                    onclick={async () => {
                        const id = await props.addAction(props.input);
                        props.reset();
                        props.setAdded(id)
                    }}
                >
                    SAVE
                </button>
                <button class="bg-red-600 rounded-lg flex-1" onclick={props.reset}>
                    RESET
                </button>
            </div>
        </Portal>
    </Show>
    )
}