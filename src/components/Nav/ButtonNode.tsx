import { createSignal, JSXElement, onMount } from "solid-js";
import { calculateLevel } from "./calculateLevel";
import { Icon } from "./Icon";

type P2 = {
    onclick: () => void;
    label: string;
    icon: JSXElement;
}

export function ButtonNode(props: P2) {
    let ref!: HTMLLIElement;
    const [level, setLevel] = createSignal(0);
    onMount(() => setLevel(calculateLevel(ref)));

    return (
        <li
            class="tree-node"
            ref={ref}
        >
            <div
                onclick={props.onclick}
                class="w-full flex items-center h-8 hover:bg-orange-500"
                style={{ "padding-left": level() + 'rem' }}
            >
                <Icon>
                    {props.icon}
                </Icon>
                {props.label}
            </div>
        </li>
    );
}
