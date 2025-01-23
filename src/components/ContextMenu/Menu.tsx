import clickOutside from "../../lib/clickOutside";
import { Props } from "./ContextMenu";
false && clickOutside;

export function Menu(props: Props) {

    return (
        <div
            ref={props.ref}
            use:clickOutside={props.close}
            class="absolute bg-slate-800 text-white rounded-md border-2 border-slate-400 z-[99]"
            style={{
                left: props.pos.x + "px",
                top: props.pos.y + "px",
            }}
        >
            <ul class="min-w-52 ">
                {props.children}
            </ul>
        </div>
    );
}
