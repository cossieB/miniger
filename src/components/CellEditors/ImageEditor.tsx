import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import { createResource, createSignal, Show } from "solid-js";
import { appDataDir, sep } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { writeFile, remove } from "@tauri-apps/plugin-fs";
import { editActor } from "../../api/mutations";
import { useAction } from "@solidjs/router";

const [dir] = createResource(async () => {
    const d = await appDataDir()
    return d + sep() + "images" + sep()
})


export function ImageEditor(props: ICellEditorParams) {
    const updateActorAction = useAction(editActor);
    let image = props.data.image;

    const api: ICellEditor = {
        getValue: () => image
    };

    (props as any).ref(api);

    const [objUrl, setObjUrl] = createSignal("");
    const src = () => {
        if (objUrl())
            return objUrl()
        if (props.data.image && dir())
            return convertFileSrc(dir() + props.data.image)
    }
    return (
        <div
            class="bg-white"
            onDragOver={e => {
                e.preventDefault();
            }}
            onDrop={async e => {
                e.preventDefault();
                if (!e.dataTransfer?.files.length) return;
                const file = e.dataTransfer.files[0];
                if (!file.type.startsWith("image")) return;
                const directory = await appDataDir();
                const oldPath = `${directory}${sep()}images${sep()}${props.data.image}`;
                const objUrl = URL.createObjectURL(file)
                setObjUrl(objUrl)
                const timestamp = Date.now().toString();
                const fileType = file.name.slice(file.name.lastIndexOf("."));
                const fileName = timestamp + fileType
                const path = `${directory}${sep()}images${sep()}${fileName}`
                const buffer = await file.arrayBuffer()
                const uint8array = new Uint8Array(buffer);
                await writeFile(path, uint8array)
                await updateActorAction('image', fileName, props.data.actorId)
                try {
                    await remove(oldPath)
                } catch (error) { }
                image = fileName
                props.stopEditing()
            }}
        >
            <Show when={!!src()}
                fallback={<p class="h-52 aspect-square text-black flex justify-center items-center text-4xl">DROP <br /> IMAGE <br /> HERE</p>}
            >
                <img class="h-52 aspect-square object-contain" src={src()} />
            </Show>
        </div>
    );
}
