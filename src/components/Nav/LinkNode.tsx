import { JSXElement } from "solid-js";
import { useLevel } from "./calculateLevel";
import { Icon } from "./Icon";
import { A } from "@solidjs/router";

type P1 = {
    href: string;
    label: string;
    icon: JSXElement;
}

export function LinkNode(props: P1) {
    const {level, setRef} = useLevel()
    return (
        <li
            class="tree-node"
            ref={setRef}
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