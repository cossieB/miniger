import { createSignal, onMount } from "solid-js";

export function calculateLevel(elem: Element | null): number {
    let level = 0;
    while (true) {
        if (!elem || elem.id == 'tree-root') break;
        if (elem.nodeName == "UL")
            level++;
        elem = elem.parentElement;
    }
    return level;
}

function useLevel() {
    let ref!: HTMLElement
    const [level, setLevel] = createSignal(0)
    onMount(() => setLevel(calculateLevel(ref)))
    return level
}

