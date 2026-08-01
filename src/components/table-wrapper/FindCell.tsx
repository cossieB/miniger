import { useAction } from "@solidjs/router";
import { SearchIcon } from "lucide-solid";
import { getInaccessible } from "~/api/data";
import { TABLE_CELL_HEIGHT } from "~/constants";
import { useCellContext } from "~/utils/createTable";
import { open, } from "@tauri-apps/plugin-dialog";
import videoExtensions from "~/videoExtensions.json"
import { editFilm } from "~/api/mutations";
import styles from "./Cells.module.css"

export function Find() {
    const action = useAction(editFilm)
    const cell = useCellContext()

    return (
        <div
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`,
            }}
        >
            <button
                title="Find file"
                class={`${styles.triggerButton} flexCenter`}
                onClick={async () => {
                    const sel = await open({
                        filters: [{
                            extensions: videoExtensions,
                            name: "Video Files",
                        }]
                    })
                    if (!sel) return;
                    await action({ path: sel, filmId: cell.row.original.filmId }, [getInaccessible.key])
                }}
            >
                <SearchIcon />
            </button>
        </div>
    )
}