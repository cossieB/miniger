import { Accessor, JSX, splitProps } from "solid-js";
import { state } from "../../state";
import { useNavigate } from "@solidjs/router";
import { useControls } from "../VideoPlayer/useControls";

type P = {
    data: (typeof state)['sidePanel']['list'][number];
    i: Accessor<number>;
} & JSX.HTMLAttributes<HTMLLIElement>;

export function SidePanelItem(props: P) {
    const navigate = useNavigate()
    const isSelected = () => state.sidePanel.selections.has(props.i());
    const isLastDraggedOver = () => state.sidePanel.lastDraggedOver === props.i();
    const isLastSelected = () => state.sidePanel.lastSelection === props.i();
    const {currentVideo} = useControls()
    const isPlaying = () => props.data.id === currentVideo()?.id
    const [_, attr] = splitProps(props, ['i', 'data']);

    return (
        <li
            class={"text-ellipsis text-nowrap overflow-hidden p-1 cursor-default [&:not(:last-child):hover]:bg-slate-700 droppable"}
            classList={{ 
                "!bg-slate-500": isSelected(), 
                "mt-8": isLastDraggedOver(), 
                'outline-dashed outline-1': isLastSelected(),
                "text-orange-500": isPlaying()
            }}
            draggable={props.i() !== state.sidePanel.list.length}
            data-i={props.i()}
            onClick={e => {
                e.preventDefault();
                if (props.i() === state.sidePanel.list.length) return //invisible item at the end of the list

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
                    state.sidePanel.setLastSelection(props.i());
                }
                else {
                    state.sidePanel.selections.clear();
                    state.sidePanel.selections.add(props.i());
                    state.sidePanel.setLastSelection(props.i());
                }
            }}
            ondragover={e => {
                e.preventDefault();
                state.sidePanel.setLastDraggedOver(props.i());
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
                state.sidePanel.setFiles(newArr);
                state.sidePanel.setLastDraggedOver(-1)
                state.sidePanel.selections.clear();
            }}
            ondblclick={() => {
                navigate(`/play?id=${props.data.id}`)
            }}
            {...attr}
        >
            {props.data.title}
        </li>
    );
}