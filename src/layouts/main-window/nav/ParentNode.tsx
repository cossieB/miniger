import { createSignal, For, type JSXElement, Show, Suspense } from "solid-js";
import { useLevel } from "./calculateLevel";
import { Icon } from "./Icon";
import { createAsync } from "@solidjs/router";
import styles from "~/layouts/main-window/MainWindow.module.css"
import { CaretIcon } from "~/components/CaretIcon";

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
            class={`tree-node ${styles.node}`}
            ref={setRef}
        >
            <div
                onclick={() => setIsOpen(p => !p)}                
                style={{ "padding-left": level() + 'rem' }}
            >
                <Icon>
                    <CaretIcon isOpen={isOpen} />
                </Icon>
                {props.label}
            </div>
            <ul class={styles.subtree} classList={{ [styles.open]: isOpen() }}>
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
            class={`tree-node ${styles.node}`}
            ref={setRef}
        >
            <div
                onclick={() => setIsOpen(p => !p)}                
                style={{ "padding-left": level() + 'rem' }}
            >
                <Icon>
                    <CaretIcon isOpen={isOpen} />
                </Icon>
                {props.label}
            </div>
            <ul class={styles.subtree} classList={{ [styles.open]: isOpen() }}>
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