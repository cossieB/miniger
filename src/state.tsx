import { ReactiveSet } from "@solid-primitives/set";
import { createStore } from "solid-js/store";
import shuffleArray from "./lib/shuffleArray";


type FileInfo = {
    title: string;
    path: string;
};

export const [state, setState] = createStore({
    status: "",
    sidePanel: {
        list: [] as FileInfo[],
        selections: new ReactiveSet<number>(),
        lastSelection: -1,
        lastDraggedOver: -1,
        push: (items: FileInfo[]) => {
            setState('sidePanel', 'list', prev => [...prev, ...items]);
        },
        insertAt(index: number , items: FileInfo,)  {
            setState('sidePanel', 'list', prev => prev.toSpliced(index, 0, items));
        },
        clear: () => {
            setState('sidePanel', 'list', [])
        },
        shuffle: () => {
            setState('sidePanel', 'list', prev => shuffleArray(prev))
        }
    },
    mainPanel: {
        selectedItems: [] as FileInfo[],
    }
})

