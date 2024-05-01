import { ReactiveSet } from "@solid-primitives/set";
import { createStore } from "solid-js/store";


export const [state, setState] = createStore({
    status: "",
    sidePanel: {
        list: [] as {title: string, path: string}[],
        selections: new ReactiveSet<number>(),
        lastSelection: 0
    }
})