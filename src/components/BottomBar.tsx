import { Show } from "solid-js";
import { state } from "../state";
import { CircleXIcon } from "lucide-solid";
import { BOTTOM_BAR_HEIGHT } from "~/constants";


export function BottomBar() {
    return (
        <div
            class="w-full bg-orange-500 pl-5 flex items-center"
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