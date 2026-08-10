import { CirclePlusIcon } from "lucide-solid";
import styles from "./TopBar.module.css"
import { state } from "~/state";
import { Portal } from "solid-js/web";

export function AddItemBtn() {
    return (
        <button title="Add..." style={{ "anchor-name": "--add-trigger" }} popoverTarget="add-options-popover">
            <CirclePlusIcon />
            <Items />
        </button>
    )
}

function Items() {
    return (
        <Portal>
            <div style={{ "position-anchor": "--add-trigger" }} class={`${styles.itemsContainer} menuPopoverAnimation`} popover id="add-options-popover">
                <div onClick={() => state.dialog.openDialog({ type: "actor" })}>Add Actor</div>
                <div onClick={() => state.dialog.openDialog({ type: "studio" })}>Add Studio</div>
            </div>
        </Portal>
    )
}