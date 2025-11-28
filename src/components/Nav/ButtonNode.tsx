import { type JSXElement } from "solid-js";
import { useLevel } from "./calculateLevel";
import { Icon } from "./Icon";

type P2 = {
    onclick: () => void;
    label: string;
    icon: JSXElement;
}

export function ButtonNode(props: P2) {
const {level, setRef} = useLevel()

    return (
        <li
            class="tree-node"
            ref={setRef}
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
