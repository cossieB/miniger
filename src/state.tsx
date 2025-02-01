import { ReactiveSet } from "@solid-primitives/set";
import { createStore } from "solid-js/store";
import shuffleArray from "./lib/shuffleArray";
import { Actor } from "./datatypes";
import "./events/drop"
import { GridApi } from "ag-grid-community";

export type PlaylistFile = {
    title: string;
    path: string;
    studio_name: string | null;
    actors: Actor[],
    tags: string[];
    id: string
};

const [state, setState] = createStore({
    gridApi: undefined as GridApi<any> | undefined,
    setGridApi: (g: GridApi<any> | undefined) => {
        setState('gridApi', g)
    },
    status: {
        message: "",
        timerId: -1,
        setStatus: (status: string, autoFade = false) => {
            clearTimeout(state.status.timerId)
            let timerId = -1
            if (autoFade)
                timerId = setTimeout(() => {
                    setState('status', 'message', "")
                }, 5000)
            setState({
                status: {
                    ...state.status,
                    message: status,
                    timerId
                }
            })
        },
        clear: () => {
            setState('status', {
                message: "",
                timerId: -1,
            })
        }
    },
    sidePanel: {
        list: [] as PlaylistFile[],
        selections: new ReactiveSet<number>(),
        lastSelection: -1,
        lastDraggedOver: -1,
        width: 200,
        push: (items: PlaylistFile[]) => {
            setState('sidePanel', 'list', prev => [...prev, ...items]);
        },
        insertAt(index: number, items: PlaylistFile[],) {
            setState('sidePanel', 'list', prev => prev.toSpliced(index, 0, ...items));
        },
        clear: () => {
            setState('sidePanel', 'list', [])
        },
        shuffle: () => {
            setState('sidePanel', 'list', prev => shuffleArray(prev))
        },
        setFiles: (files: PlaylistFile[]) => {
            setState('sidePanel', 'list', files)
        },
        deleteSelections: () => {
            setState('sidePanel', prev => ({
                list: prev.list.filter((_item, i) => !state.sidePanel.selections.has(i)),
                lastSelection: -1
            }))
            state.sidePanel.selections.clear()
        },
        clearSelections: () => {
            state.sidePanel.selections.clear();
            setState('sidePanel', 'lastSelection', -1)
        },
        setLastSelection: (i: number) => {
            setState('sidePanel', 'lastSelection', i)
        },
        setLastDraggedOver: (i: number) => {
            setState('sidePanel', 'lastDraggedOver', i);
        },
        setWidth: (width: number) => {
            setState('sidePanel', 'width', width)
        }
    },
    mainPanel: {
        width: () => state.windowDimensions.width - state.tree.width - state.sidePanel.width,
        selectedItems: [] as PlaylistFile[],
        setSelectedItems: (items: PlaylistFile[]) => {
            setState('mainPanel', 'selectedItems', items)
        }
    },
    tree: {
        width: 208,
        setWidth: (width: number) => {
            setState('tree', 'width', width)
        }
    },
    windowDimensions: {
        width: window.innerWidth,
        height: window.innerHeight,
        set: (dimensions: {width?: number, height?: number}) => {
            setState('windowDimensions', prev => ({...prev, ...dimensions}))
        }
    }
})

export {state}