import { useContext } from "solid-js";
import { ContextMenuContext } from "./ContextMenu";

export function useContextMenuContext() {
    const position = useContext(ContextMenuContext);
    if (!position)
        throw new Error("This component has to be a child of ContextMenu");
    return position;
}
