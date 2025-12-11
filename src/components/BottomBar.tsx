import { Show } from "solid-js";
import { state } from "../state";
import { CircleXIcon } from "lucide-solid";


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
            <CircleXIcon
                class="mr-5"
                onclick={state.status.clear}
            />
        </Show>
    )
}