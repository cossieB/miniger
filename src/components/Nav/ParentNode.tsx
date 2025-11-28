import { createSignal, For, type JSXElement, Show, Suspense } from "solid-js";
import { useLevel } from "./calculateLevel";
import { Icon } from "./Icon";
import { CaretIcon } from "../CaretIcon";
import { createAsync } from "@solidjs/router";

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

type P1<T> = {
    fetcher: () => T[] | Promise<T[]>
    children: (item: T) => JSXElement
    label: string
}

export function AsyncParentNode<T>(props: P1<T>) {
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
                <Show when={isOpen()}>
                    <List
                        {...props}
                    />
                </Show>
            </ul>
        </li>
    );
}



function List<T>(props: P1<T>) {
    const data = createAsync(() => Promise.resolve(props.fetcher()))

    return (
        <Suspense>
            <For each={data.latest}>
                {props.children}
            </For>
        </Suspense>
    )
}