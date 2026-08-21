import { createEffect, createSignal, on, Show } from "solid-js";
import { useCellContext } from "~/utils/createTable";
import { TABLE_CELL_HEIGHT } from "~/constants";
import styles from "./Cells.module.css"
import { Portal } from "solid-js/web";
import clickOutside from "~/lib/clickOutside";
import { DropZone } from "../FilePicker";
import { saveImg } from "~/utils/saveImg";
import { ImgSubfolder } from "~/types";

false && clickOutside

type Props = {
    folder: ImgSubfolder
    id: string | number
}

export function ImageEditor(props: Props) {
    const cell = useCellContext<string | null>()
    const [edit, setEdit] = createSignal(false)
    const [loading, setLoading] = createSignal(true)

    const [file, setFile] = createSignal<File | null>(null)
    
    createEffect(on(file, async newFile => {
        if (!newFile) return;
        setLoading(true)
        await saveImg(newFile, props.folder, props.id);
        setLoading(false)
        setEdit(false)
    }))

    const anchorName = "--img" + cell.id

    return (
        <div
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`,
                "anchor-name": anchorName
            }}
            classList={{
                "animate-pulse": loading()
            }}
            class={`${styles.cellWrapper} relative`}
            onDblClick={() => setEdit(true)}

            onkeyup={e => {
                if (e.key === "Escape") setEdit(false)
            }}
        >
            <Show
                when={edit()}
                fallback={
                    <span>
                        Double click
                    </span>
                }
            >
                <Portal>
                    <div
                        style={{
                            "position-anchor": anchorName,

                        }}
                        class={styles.imgEditor}
                        onDragOver={e => {
                            e.preventDefault();
                        }}
                        use:clickOutside={() => setEdit(false)}
                        onClick={e => e.stopPropagation()}                        
                    >
                        <DropZone
                            setFile={setFile}
                            image={`${props.id}.webp`}
                            subfolder={props.folder}
                        />
                    </div>
                </Portal>
            </Show>
        </div>
    );
}
