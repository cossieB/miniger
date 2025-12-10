import { createUniqueId } from "solid-js";
import { createStore } from "solid-js/store";
import shuffleArray from "~/lib/shuffleArray";
import type { SidepanelFile, PlaylistFile, ExtraProps } from "~/state";

const [sidePanel, setSidepanel] = createStore({
    list: [] as SidepanelFile[],
    selections: {
        lastSelection: -1,
        all: new Set<number>(),
        add: (i: number) => {
            if (i < 0 || i > sidePanel.list.length) return
            sidePanel.setField(i, "isSelected", true)
            sidePanel.selections.all.add(i);
            sidePanel.selections.setLastSelection(i)
        },
        set: (i: number) => {
            sidePanel.selections.all.forEach(num => {
                sidePanel.setField(num, "isSelected", false)
            })
            sidePanel.selections.all.clear();
            sidePanel.setField(i, "isSelected", true)
            sidePanel.selections.all.add(i);
            sidePanel.selections.setLastSelection(i)
        },
        deleteSelections: () => {
            sidePanel.selections.setLastSelection(-1)
            setSidepanel(prev => ({
                list: prev.list.filter((_, i) => !sidePanel.selections.all.has(i)),
            }))
            sidePanel.selections.all.clear()
        },
        clearSelections: () => {
            sidePanel.selections.all.forEach(num => {
                sidePanel.setField(num, "isSelected", false)
            })
            sidePanel.selections.all.clear();
            sidePanel.selections.setLastSelection(-1)
        },
        setLastSelection: (i: number) => {
            const last = sidePanel.selections.lastSelection
            setSidepanel('selections', 'lastSelection', i);
            if (last > -1 && last < sidePanel.list.length)
                setSidepanel('list', last, 'selectedLast', false)
            if (i > -1 && i < sidePanel.list.length)
                setSidepanel('list', i, 'selectedLast', true)
        },
        unselect: (i: number) => {
            sidePanel.selections.all.delete(i)
            sidePanel.setField(i, 'isSelected', false);
        },
        getAll: () => {
            return Array.from(sidePanel.selections.all).map(i => sidePanel.list[i])
        }
    },

    lastDraggedOver: -1,
    width: 300,
    push: (items: PlaylistFile[]) => {
        setSidepanel('list', prev => [...prev, ...items.map(x => ({
            ...x,
            cantPlay: false,
            isSelected: false,
            selectedLast: false,
            lastDraggedOver: false,
            rowId: x.rowId ?? createUniqueId()
        }))]);
    },
    insertAt(index: number, items: PlaylistFile[],) {
        setSidepanel('list', prev => prev.toSpliced(index, 0, ...items.map(x => ({
            ...x,
            cantPlay: false,
            isSelected: false,
            selectedLast: false,
            lastDraggedOver: false,
            rowId: x.rowId ?? createUniqueId()
        }))));
    },
    clear: () => {
        setSidepanel('list', [])
    },
    shuffle: () => {
        setSidepanel('list', prev => shuffleArray(prev))
    },
    setFiles: (files: PlaylistFile[]) => {
        setSidepanel('list', files.map(x => ({
            ...x,
            cantPlay: false,
            isSelected: false,
            selectedLast: false,
            lastDraggedOver: false,
            rowId: x.rowId ?? createUniqueId()
        })))
    },
    setLastDraggedOver: (i: number) => {
        const last = sidePanel.lastDraggedOver;
        if (last > -1 && last < sidePanel.list.length)
            setSidepanel('list', last, 'lastDraggedOver', false)
        if (i > -1 && i < sidePanel.list.length)
            setSidepanel('list', i, 'lastDraggedOver', true)
        setSidepanel('lastDraggedOver', i);
    },
    setWidth: (width: number) => {
        setSidepanel('width', width)
    },
    markDirty: (rowId: string) => {
        const i = sidePanel.list.findIndex(p => p.rowId === rowId)
        setSidepanel('list', i, prev => ({
            ...prev, cantPlay: true
        }))
    },
    setField: <T extends keyof ExtraProps>(i: number, field: T, value: ExtraProps[T]) => {
        setSidepanel('list', i, field, value)
    },
})

export {sidePanel}