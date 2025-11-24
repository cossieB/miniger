import { createSignal, JSXElement } from "solid-js";
import { useLevel } from "./calculateLevel";
import { Icon } from "./Icon";
import { CaretIcon } from "../CaretIcon";

type P = {
    label: string,
    children: JSXElement
    icon?: JSXElement
}

export function ParentNode(props: P) {
    const [isOpen, setIsOpen] = createSignal(false);
    const { level, setRef } = useLevel()
    return (
        <li
            class="tree-node"
            ref={setRef}
        >
            <div
                onclick={() => setIsOpen(p => !p)}
                class="w-full flex items-center h-8 hover:bg-orange-500"
                style={{ "padding-left": level() + 'rem' }}
            >
                <Icon>
                    <CaretIcon isOpen={isOpen} />
                </Icon>
                {props.label}
            </div>
            <ul class="overflow-hidden transition-[height_2s_ease]" classList={{ "h-0": !isOpen(), "h-auto": isOpen() }}>
                {props.children}
            </ul>
        </li>
    );
}