import { Show } from "solid-js";
import { ClearSVG } from "../icons";
import { state } from "../state";


export function BottomBar() {
    return (
        <div class="w-full h-8 bg-orange-500 pl-5 flex items-center">
            <ClearMessageBtn />
            {state.status.message}
        </div>
    );
}

function ClearMessageBtn() {
    return (
        <Show when={!!state.status.message}>
            <ClearSVG
                title="Clear Notification"
                class="mr-5"
                onclick={state.status.clear}
            />
        </Show>
    )
}