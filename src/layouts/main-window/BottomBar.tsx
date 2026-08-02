import { Show } from "solid-js";
import { state } from "~/state";
import { CircleXIcon } from "lucide-solid";
import { BOTTOM_BAR_HEIGHT } from "~/constants";
import styles from "~/layouts/main-window/MainWindow.module.css"

export function BottomBar() {
    return (
        <div
            class={styles.bottombar}
            style={{
                height: BOTTOM_BAR_HEIGHT + "px"
            }}
        >
            <ClearMessageBtn />
            {state.status.message}
        </div>
    );
}

function ClearMessageBtn() {
    return (
        <Show when={!!state.status.message}>
            <CircleXIcon
                class="mr-5"
                onclick={state.status.clear}
            />
        </Show>
    )
}