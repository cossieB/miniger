import { ReactiveSet } from "@solid-primitives/set";
import { createStore } from "solid-js/store";
import shuffleArray from "./lib/shuffleArray";
import { Actor } from "./datatypes";

export type PlaylistFile = {
    title: string;
    path: string;
    studio_name: string | null;
    actors: Actor[],
    tags: string | null;
};

export const [state, setState] = createStore({
    status: {
        message: "",
        timerId: -1,
        setStatus: (status: string) => {
            clearTimeout(state.status.timerId)
            const timerId = setTimeout(() => {
                setState('status', 'message', "")
            }, 5000) 
            setState({
                status: {
                    ...state.status,
                    message: status,
                    timerId
                }
            })
        }
    },
    sidePanel: {
        list: [] as PlaylistFile[],
        selections: new ReactiveSet<number>(),
        lastSelection: -1,
        lastDraggedOver: -1,
        push: (items: PlaylistFile[]) => {
            setState('sidePanel', 'list', prev => [...prev, ...items]);
        },
        insertAt(index: number , items: PlaylistFile,)  {
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
        selectedItems: [] as PlaylistFile[],
    }
})

