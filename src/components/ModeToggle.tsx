import { For, type JSXElement, type Setter } from "solid-js";
import { Portal } from "solid-js/web";
import titleCase from "~/lib/titleCase";

export type P = {
    modes: {
        id: string
        icon: JSXElement
    }[]
    active: number
    setActive: Setter<number>
}

export function ModeToggle(props: P) {
    return (
        <Portal>
            <div
                class="rounded-md absolute bottom-16 left-1/2 z-100 p-2 ">
                <ul class="flex">
                    <For each={props.modes}>
                        {(mode, i) => <li
                            title={titleCase(mode.id + " view")}
                            class="bg-[#00000070] hover:bg-black transition-bg p-2"
                            onclick={() => props.setActive(i())}
                        >
                            {mode.icon}
                        </li>}
                    </For>
                </ul>
            </div>
        </Portal>
    );
}
