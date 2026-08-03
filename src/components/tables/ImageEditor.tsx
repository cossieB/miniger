import { createSignal, Show } from "solid-js";
import { appDataDir, sep } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { writeFile, remove } from "@tauri-apps/plugin-fs";
import { useCellContext } from "~/utils/createTable";
import { TABLE_CELL_HEIGHT } from "~/constants";
import { state } from "~/state";
import styles from "./Cells.module.css"
import { Portal } from "solid-js/web";
import clickOutside from "~/lib/clickOutside";

false && clickOutside

const d = await appDataDir()
const dir = d + sep() + "images" + sep()

type Props = {
    onUpdate: (val: string) => Promise<void>
}

export function ImageEditor(props: Props) {
    const cell = useCellContext<string | null>()
    const [edit, setEdit] = createSignal(false)
    const [loading, setLoading] = createSignal(true)
    const [startingVal, setStartingVal] = createSignal(cell.getValue())
    const [value, setValue] = createSignal(cell.getValue())

    const [objUrl, setObjUrl] = createSignal("");
    const src = () => {
        if (objUrl())
            return objUrl()
        if (value())
            return convertFileSrc(dir + value())
    }

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
                        {value()}
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
                        onDrop={async e => {
                            setLoading(true)
                            e.preventDefault();
                            if (!e.dataTransfer?.files.length) return;
                            const file = e.dataTransfer.files[0];
                            if (!file.type.startsWith("image")) return;
                            const directory = await appDataDir();
                            const oldPath = `${directory}${sep()}images${sep()}${value()}`;
                            const objUrl = URL.createObjectURL(file)
                            setObjUrl(objUrl)
                            const timestamp = Date.now().toString();
                            const fileType = file.name.slice(file.name.lastIndexOf("."));
                            const fileName = timestamp + fileType
                            const path = `${directory}${sep()}images${sep()}${fileName}`
                            const buffer = await file.arrayBuffer()
                            const uint8array = new Uint8Array(buffer);
                            try {
                                await writeFile(path, uint8array)
                                await props.onUpdate(fileName)
                            }
                            catch (error) {
                                setValue(startingVal())
                                setLoading(false)
                                state.status.setStatus("Error updating image: " + String(e))
                                return
                            }
                            setValue(fileName);
                            setStartingVal(fileName)
                            setEdit(false)
                            setLoading(false)
                            try {
                                await remove(oldPath)
                            } catch (error) { }
                        }}
                    >
                        <Show
                            when={!!src()}
                            fallback={<p class="h-52 absolute aspect-square text-black flex justify-center items-center text-4xl">DROP <br /> IMAGE <br /> HERE</p>}
                        >
                            <img
                                class="fillUp"
                                src={src()}
                                onError={e => e.currentTarget.src = "/Question_Mark.svg"}
                            />
                        </Show>
                    </div>
                </Portal>
            </Show>
        </div>
    );
}
