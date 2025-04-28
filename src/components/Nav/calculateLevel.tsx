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


export function useLevel() {
    const [ref, setRef] = createSignal<HTMLLIElement | null>(null);
    const [level, setLevel] = createSignal(0);
    onMount(() => {
        setLevel(calculateLevel(ref()));
    })
    return {level, setRef}
}