import { CirclePlusIcon } from "lucide-solid";
import styles from "./AddItemBtn.module.css"
import { state } from "~/state";

export function AddItemBtn() {
    return (
        <button popoverTarget="add-options-popover">
            <CirclePlusIcon />
            <Items />
        </button>
    )
}

function Items() {
    return (
        <div class={styles.itemsContainer} popover id="add-options-popover">
            <button onClick={() => state.dialog.openDialog({ type: "actor" })} class="button">Add Actor</button>
            <button onClick={() => state.dialog.openDialog({ type: "studio" })} class="button">Add Studio</button>
        </div>
    )
}