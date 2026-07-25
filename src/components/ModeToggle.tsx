import type { LucideProps } from "lucide-solid";
import { For, type JSXElement } from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import titleCase from "~/lib/titleCase";
import { setActiveView } from "~/routes/Movies";

export type P = {
    modes: {
        label: string
        icon: (props: LucideProps) => JSXElement
    }[]
}

export function ModeToggle(props: P) {
    return (
        <Portal>
            <div
                class="rounded-md absolute bottom-16 left-1/2 z-100 p-2 ">
                <ul class="flex">
                    <For each={props.modes}>
                        {(mode, i) => <li
                            title={titleCase(mode.label + " view")}
                            class="bg-[#00000070] hover:bg-black transition-bg p-2"
                            onclick={() => setActiveView(i())}
                        >
                            <Dynamic component={mode.icon} />
                        </li>}
                    </For>
                </ul>
            </div>
        </Portal>
    );
}
