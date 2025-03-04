import { createMemo, JSX, splitProps } from "solid-js";
import { state } from "../../state";
import { useLocation, useNavigate, useSearchParams } from "@solidjs/router";

type P = {
    data: (typeof state)['sidePanel']['list'][number];
    i: number;
} & JSX.HTMLAttributes<HTMLLIElement>;

let timerId = -1
let j = -1

export function SidePanelItem(props: P) {
    const navigate = useNavigate()

    const [searchParams] = useSearchParams<{ rowId: string }>();
    const location = useLocation()
    console.log("HERE")
    const isPlaying = createMemo(() => {
        if (location.pathname !== "/play") return false;
        return searchParams.rowId === props.data.rowId;
    })
    const [_, attr] = splitProps(props, ['i', 'data']);

    return (
        <li
            class="text-ellipsis text-nowrap overflow-hidden p-1 cursor-default not-last:hover:bg-slate-700 transition-[margin-top] not-last:odd:bg-slate-900 not-last:even:bg-slate-800 relative sidepanel-item -outline-offset-1"
            classList={{
                "!bg-slate-500": props.data.isSelected,
                "mt-4": props.data.lastDraggedOver,
                'outline-dashed outline-1': props.data.selectedLast,
                "text-gray-400!": props.data.cantPlay,
                "text-orange-500": isPlaying(),
            }}
            data-i={props.i}
            onClick={e => {
                e.preventDefault();
                if (props.i === state.sidePanel.list.length) return //invisible item at the end of the list

                if (e.ctrlKey) {
                    if (props.data.isSelected) {
                        state.sidePanel.selections.unselect(props.i)
                    }
                    else {
                        state.sidePanel.selections.add(props.i)
                    }
                }
                else if (e.shiftKey) {
                    const [min, max] = [Math.min(props.i, state.sidePanel.selections.lastSelection), Math.max(props.i, state.sidePanel.selections.lastSelection)];
                    for (let i = min; i <= max; i++) {
                        state.sidePanel.selections.add(i);
                    }
                    state.sidePanel.selections.setLastSelection(props.i);
                }
                else {
                    state.sidePanel.selections.set(props.i)
                }
            }}
            ondragenter={e => {
                clearTimeout(timerId);
                j = props.i;
                timerId = setTimeout(() => {
                    state.sidePanel.setLastDraggedOver(props.i);
                    j = -1
                }, 100)
            }}
            ondragover={e => {
                e.preventDefault();
            }}
            ondragend={e => {
                e.preventDefault();
                clearTimeout(timerId);
                if (j > -1) {
                    state.sidePanel.setLastDraggedOver(j)
                }
                if (state.sidePanel.lastDraggedOver == -1) return;
                const newArr: typeof state.sidePanel.list = [];
                for (let i = 0; i < state.sidePanel.lastDraggedOver; i++) {
                    if (state.sidePanel.selections.all.has(i)) continue;
                    newArr.push(state.sidePanel.list[i]);
                }
                state.sidePanel.selections.all.forEach(num => {
                    newArr.push(state.sidePanel.list[num]);
                });
                for (let i = state.sidePanel.lastDraggedOver; i < state.sidePanel.list.length; i++) {
                    if (state.sidePanel.selections.all.has(i)) continue;
                    newArr.push(state.sidePanel.list[i]);
                }
                state.sidePanel.setFiles(newArr);
                state.sidePanel.setLastDraggedOver(-1)
                state.sidePanel.selections.all.clear();
            }}
            ondblclick={() => {
                navigate(`/play?rowId=${props.data.rowId}`)
            }}
            {...attr}
        >
            {props.data.title}
        </li>
    );
}