import { A, createAsync } from "@solidjs/router"
import { For, JSX, JSXElement, Show, createSignal, onMount } from "solid-js"
import { getStudios, getTags } from "../../api/data"
import { state } from "../../state"

export function Tree() {
    const tags = createAsync(() => getTags(), { initialValue: [] })
    const studios = createAsync(() => getStudios(), {initialValue: []})
    return (
        <nav 
            class="top-0 left-0 h-full bg-slate-950 text-orange-50 shrink-0 overflow-y-auto"
            style={{width: state.tree.width + "px"}}
            >
            <ul id="tree-root">
                <Node label="Movies" href="/movies">
                    <Node label="All Movies" href="/movies" />
                    <Node label="Inaccessible" href="/movies/inaccessible" />
                    <Node label="Tags" href="/movies">
                        <For each={tags()}>
                            {tag => <Node label={tag.tag} href={`/movies/tags/${tag.tag}`} />}
                        </For>
                    </Node>
                    <Node label="Studios" href="/movies">
                        <For each={studios()}>
                            {studio => <Node label={studio.name} href={`/movies/studios/${studio.studio_id}`} />}
                        </For>
                    </Node>
                </Node>
                <Node label="Actors" href="/actors" />
                <Node label="Studios" href="/studios" />
            </ul>
        </nav>
    )
}

type Props = {
    label: string,
    href: string,
    children?: JSXElement
}

function calculateLevel(elem: Element | null): number {
    let level = 0;
    while (true) {
        if (!elem || elem.id == 'tree-root') break
        if (elem.nodeName == "UL")
            level++;
        elem = elem.parentElement
    }
    return level
}

function Node(props: Props) {
    let ref!: HTMLLIElement
    const [isOpen, setIsOpen] = createSignal(false)
    const [level, setLevel] = createSignal(0)

    onMount(() => setLevel(calculateLevel(ref)))

    return (
        <>
            <A href={props.href}>
                <li
                    class="w-full flex items-center h-8 tree-node hover:bg-orange-500"
                    ref={ref}
                    style={{ "padding-left": level() + 'rem' }}
                >
                    <Show
                        when={!!props.children}
                        fallback={
                            <Icon>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-bar-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5" />
                                </svg>
                            </Icon>}
                    >
                        <Icon onclick={() => setIsOpen(p => !p)}>
                            <svg classList={{ "rotate-90": isOpen() }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                            </svg>
                        </Icon>
                    </Show>
                    <A href={props.href}> {props.label} </A>
                </li>
            </A>
            <Show when={!!props.children}>
                <ul class="overflow-hidden" classList={{ "h-0": !isOpen() }}>
                    {props.children}
                </ul>
            </Show>
        </>
    )
}

function Icon(props: JSX.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span class="w-4 flex items-center justify-center" {...props}>
            {props.children}
        </span>
    )
}