import { Accessor } from "solid-js";
import { setState, state } from "../state";

type P = {
    path: (typeof state)['sidePanel']['list'][number];
    i: Accessor<number>;
};
export function SidePanelItem(props: P) {
    const isSelected = () => state.sidePanel.selections.has(props.i());
    const isLastDraggedOver = () => state.sidePanel.lastDraggedOver === props.i();
    return (
        <li
            class={"text-ellipsis text-nowrap overflow-hidden p-1 cursor-default hover:bg-slate-700 "}
            classList={{ "!bg-slate-500": isSelected(), "mt-8": isLastDraggedOver() }}
            draggable="true"
            onClick={e => {
                e.preventDefault();
                if (!e.ctrlKey) {
                    state.sidePanel.selections.clear();
                }
                if (e.shiftKey) {
                    const [min, max] = [Math.min(props.i(), state.sidePanel.lastSelection), Math.max(props.i(), state.sidePanel.lastSelection)];
                    for (let i = min; i <= max; i++) {
                        state.sidePanel.selections.add(i);
                    }
                }
                state.sidePanel.selections.add(props.i());
                setState('sidePanel', 'lastSelection', props.i());
            }}
            ondragover={e => {
                e.preventDefault();
                setState('sidePanel', 'lastDraggedOver', props.i());
            }}
            ondragend={e => {
                e.preventDefault();
                const newArr: typeof state.sidePanel.list = [];
                for (let i = 0; i < state.sidePanel.lastDraggedOver; i++) {
                    if (state.sidePanel.selections.has(i)) continue;
                    newArr.push(state.sidePanel.list[i]);
                }
                state.sidePanel.selections.forEach(num => {
                    newArr.push(state.sidePanel.list[num]);
                });
                for (let i = state.sidePanel.lastDraggedOver; i < state.sidePanel.list.length; i++) {
                    if (state.sidePanel.selections.has(i)) continue;
                    newArr.push(state.sidePanel.list[i]);
                }
                setState({
                    sidePanel: {
                        ...state.sidePanel,
                        list: newArr,
                        lastDraggedOver: -1,
                    }
                });
                state.sidePanel.selections.clear();
            }}
        >
            {props.path.title}
        </li>
    );
}
