import { ReactiveSet } from "@solid-primitives/set";
import { createStore } from "solid-js/store";


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
        }
    },
    mainPanel: {
        selectedItems: [] as FileInfo[],
    }
})

