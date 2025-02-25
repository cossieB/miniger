import { createSignal, JSXElement, onMount } from "solid-js";
import { calculateLevel } from "./calculateLevel";
import { Icon } from "./Icon";

type P = {
    label: string,
    children: JSXElement
    icon?: JSXElement
}

export function ParentNode(props: P) {
    let ref!: HTMLLIElement;
    const [isOpen, setIsOpen] = createSignal(false);
    const [level, setLevel] = createSignal(0);
    onMount(() => setLevel(calculateLevel(ref)));
    return (
        <li
            class="tree-node"
            ref={ref}
        >
            <div
                onclick={() => setIsOpen(p => !p)}
                class="w-full flex items-center h-8 hover:bg-orange-500"
                style={{ "padding-left": level() + 'rem' }}
            >
                <Icon>
                    <svg classList={{ "rotate-90": isOpen() }} xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-caret-right-fill transition-[rotate]" viewBox="0 0 16 16">
                        <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                    </svg>
                </Icon>
                {props.label}
            </div>
            <ul class="overflow-hidden" classList={{ "h-0": !isOpen() }}>
                {props.children}
            </ul>
        </li>
    );
}
