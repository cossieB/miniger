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
