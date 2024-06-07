import { Accessor, JSX } from "solid-js";
import { setState, state } from "../../state";

type P = {
    data: (typeof state)['sidePanel']['list'][number];
    i: Accessor<number>;
} & JSX.HTMLAttributes<HTMLLIElement>;

export function SidePanelItem(props: P) {
    const isSelected = () => state.sidePanel.selections.has(props.i());
    const isLastDraggedOver = () => state.sidePanel.lastDraggedOver === props.i();
    const isLastSelected = () => state.sidePanel.lastSelection === props.i();
    return (
        <li
            class={"text-ellipsis text-nowrap overflow-hidden p-1 cursor-default [&:not(:last-child):hover]:bg-slate-700"}
            classList={{ "!bg-slate-500": isSelected(), "mt-8": isLastDraggedOver(), 'outline-dashed outline-1': isLastSelected()}}
            draggable={props.i() !== state.sidePanel.list.length}
            data-i={props.i()}
            onClick={e => {
                e.preventDefault();
                if (props.i() === state.sidePanel.list.length) return

                if (e.ctrlKey) {
                    if (isSelected()) {
                        state.sidePanel.selections.delete(props.i());
                    }
                    else {
                        state.sidePanel.selections.add(props.i())
                    }
                }
                else if (e.shiftKey) {
                    const [min, max] = [Math.min(props.i(), state.sidePanel.lastSelection), Math.max(props.i(), state.sidePanel.lastSelection)];
                    for (let i = min; i <= max; i++) {
                        state.sidePanel.selections.add(i);
                    }
                    setState('sidePanel', 'lastSelection', props.i());
                }
                else {
                    state.sidePanel.selections.clear();
                    state.sidePanel.selections.add(props.i());
                    setState('sidePanel', 'lastSelection', props.i());
                }
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
            {...props}
        >
            {props.data.title}
        </li>
    );
}