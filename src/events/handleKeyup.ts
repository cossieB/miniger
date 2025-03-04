import { state } from "../state";

export function handleKeyup(e: KeyboardEvent) {
    e.preventDefault();
    if (e.key == 'Delete') {
        state.sidePanel.selections.deleteSelections()
    }
    if (e.key == "a" && e.ctrlKey) {
        for (let i = 0; i < state.sidePanel.list.length; i++) {
            state.sidePanel.selections.add(i)
        }
    }
}