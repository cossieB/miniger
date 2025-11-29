import { type GridApi } from "ag-grid-community";
import { createStore } from "solid-js/store";
import shuffleArray from "./lib/shuffleArray";
import { createUniqueId } from "solid-js";
import { type Require } from "./lib/utilityTypes";

export type PlaylistFile = {
    title: string;
    path: string;
    cantPlay?: boolean,
    rowId?: string
};

type ExtraProps = {
    isSelected: boolean,
    selectedLast: boolean,
    lastDraggedOver: boolean
}

type SidepanelFile = ExtraProps & Require<PlaylistFile, 'rowId'>

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
        list: [] as SidepanelFile[],
        selections: {
            lastSelection: -1,
            all: new Set<number>(),
            add: (i: number) => {
                if (i < 0 || i > state.sidePanel.list.length) return
                state.sidePanel.setField(i, "isSelected", true)
                state.sidePanel.selections.all.add(i);
                state.sidePanel.selections.setLastSelection(i)
            },
            set: (i: number) => {
                state.sidePanel.selections.all.forEach(num => {
                    state.sidePanel.setField(num, "isSelected", false)
                })
                state.sidePanel.selections.all.clear();
                state.sidePanel.setField(i, "isSelected", true)
                state.sidePanel.selections.all.add(i);
                state.sidePanel.selections.setLastSelection(i)
            },
            deleteSelections: () => {
                state.sidePanel.selections.setLastSelection(-1)
                setState('sidePanel', prev => ({
                    list: prev.list.filter((_, i) => !state.sidePanel.selections.all.has(i)),
                }))
                state.sidePanel.selections.all.clear()
            },
            clearSelections: () => {
                state.sidePanel.selections.all.forEach(num => {
                    state.sidePanel.setField(num, "isSelected", false)
                })
                state.sidePanel.selections.all.clear();
                state.sidePanel.selections.setLastSelection(-1)
            },
            setLastSelection: (i: number) => {
                const last = state.sidePanel.selections.lastSelection
                setState('sidePanel', 'selections', 'lastSelection', i);
                if (last > -1 && last < state.sidePanel.list.length)
                    setState('sidePanel', 'list', last, 'selectedLast', false)
                if (i > -1 && i < state.sidePanel.list.length)
                    setState('sidePanel', 'list', i, 'selectedLast', true)
            },
            unselect: (i: number) => {
                state.sidePanel.selections.all.delete(i)
                state.sidePanel.setField(i, 'isSelected', false);
            },
            getAll: () => {
                return Array.from(state.sidePanel.selections.all).map(i => state.sidePanel.list[i])
            }
        },

        lastDraggedOver: -1,
        width: 300,
        push: (items: PlaylistFile[]) => {
            setState('sidePanel', 'list', prev => [...prev, ...items.map(x => ({
                ...x,
                cantPlay: false,
                isSelected: false,
                selectedLast: false,
                lastDraggedOver: false,
                rowId: x.rowId ?? createUniqueId()
            }))]);
        },
        insertAt(index: number, items: PlaylistFile[],) {
            setState('sidePanel', 'list', prev => prev.toSpliced(index, 0, ...items.map(x => ({
                ...x,
                cantPlay: false,
                isSelected: false,
                selectedLast: false,
                lastDraggedOver: false,
                rowId: x.rowId ?? createUniqueId()
            }))));
        },
        clear: () => {
            setState('sidePanel', 'list', [])
        },
        shuffle: () => {
            setState('sidePanel', 'list', prev => shuffleArray(prev))
        },
        setFiles: (files: PlaylistFile[]) => {
            setState('sidePanel', 'list', files.map(x => ({
                ...x,
                cantPlay: false,
                isSelected: false,
                selectedLast: false,
                lastDraggedOver: false,
                rowId: x.rowId ?? createUniqueId()
            })))
        },

        setLastDraggedOver: (i: number) => {
            const last = state.sidePanel.lastDraggedOver;
            if (last > -1 && last < state.sidePanel.list.length)
                setState('sidePanel', 'list', last, 'lastDraggedOver', false)
            if (i > -1 && i < state.sidePanel.list.length)
                setState('sidePanel', 'list', i, 'lastDraggedOver', true)
            setState('sidePanel', 'lastDraggedOver', i);
        },
        setWidth: (width: number) => {
            setState('sidePanel', 'width', width)
        },
        markDirty: (rowId: string) => {
            const i = state.sidePanel.list.findIndex(p => p.rowId === rowId)
            setState('sidePanel', 'list', i, prev => ({
                ...prev, cantPlay: true
            }))
        },
        setField: <T extends keyof ExtraProps>(i: number, field: T, value: ExtraProps[T]) => {
            setState("sidePanel", 'list', i, field, value)
        },
    },
    mainPanel: {
        width: () => state.windowDimensions.width - state.tree.width - state.sidePanel.width,
        selectedItems: [] as PlaylistFile[],
        setSelectedItems: (items: PlaylistFile[]) => {
            setState('mainPanel', 'selectedItems', items)
        }
    },
    tree: {
        width: 150,
        setWidth: (width: number) => {
            setState('tree', 'width', width)
        }
    },
    windowDimensions: {
        width: window.innerWidth,
        height: window.innerHeight,
        set: (dimensions: { width?: number, height?: number }) => {
            setState('windowDimensions', prev => ({ ...prev, ...dimensions }))
        }
    },
    miniplayer: null as { title: string, path: string } | null,
    setMiniplayer: (obj: { title: string, path: string } | null) => {
        setState('miniplayer', obj)
    }
})

export { state }