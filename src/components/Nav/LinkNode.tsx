import { createSignal, JSXElement, onMount } from "solid-js";
import { calculateLevel } from "./calculateLevel";
import { Icon } from "./Icon";
import { A } from "@solidjs/router";

type P1 = {
    href: string;
    label: string;
    icon: JSXElement;
}

export function LinkNode(props: P1) {
    let ref!: HTMLLIElement
    const [level, setLevel] = createSignal(0);
    onMount(() => {
        setLevel(calculateLevel(ref))})
    return (
        <li
            class="tree-node"
            ref={ref}
        >
            <A
                href={props.href}
                class="w-full flex items-center h-8 hover:bg-orange-500"
                style={{ "padding-left": level() + 'rem' }}
            >
                <Icon>
                    {props.icon}
                </Icon>
                {props.label}
            </A>
        </li>
    )
}