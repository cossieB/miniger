import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, join, sep } from "@tauri-apps/api/path";
import { createSignal, onCleanup, Show, type Setter } from "solid-js";
import { ImgSubfolder } from "~/types";

type Props = {
    setFile: Setter<File | null>
    image?: string | null
    subfolder: ImgSubfolder
}

const dir = await join(await appDataDir(), "images")

export function DropZone(props: Props) {
    let ref!: HTMLLabelElement
    const [objectUrl, setObjectUrl] = createSignal("")
    const [errored, setErrored] = createSignal(false)
    onCleanup(() => URL.revokeObjectURL(objectUrl()));

    const src = () => {
        if (objectUrl())
            return objectUrl()
        if (errored())
            return undefined
        if (props.image)
            return convertFileSrc(dir + sep() + props.subfolder + sep() + props.image) + `?n=${Date.now()}`
    }

    const handleFiles = (files: FileList | null | undefined) => {
        if (!files || !files.length) return;

        const fileArray = Array.from(files);
        const imageFile = fileArray.find(f => f.type.startsWith("image/"));

        if (!imageFile) return;

        URL.revokeObjectURL(objectUrl());
        setObjectUrl(URL.createObjectURL(imageFile));
        props.setFile(imageFile);
    };

    return (
        <label
            ref={ref}
            class="file-drop"
            onDragOver={e => e.preventDefault()}

            onDrop={async e => {
                e.preventDefault()
                ref.classList.remove("invalid", "dragover")
                handleFiles(e.dataTransfer?.files)
            }}
        >
            <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={e => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                }}
                title=""
                onDragEnter={e => {
                    e.preventDefault();
                    const items = Array.from(e.dataTransfer?.items ?? []);
                    const hasImage = items.some(item => {
                        const isLocalImage = item.kind === 'file' && item.type.startsWith('image/');
                        const isExternalImage = item.kind === 'string' && (item.type === 'text/html' || item.type === 'text/uri-list');
                        return isLocalImage || isExternalImage;
                    });

                    if (hasImage) {
                        ref.classList.remove('invalid');
                        ref.classList.add('dragover');
                    }
                    else {
                        ref.classList.remove('dragover');
                        ref.classList.add('invalid');
                    }
                }}

                onDragLeave={e => {
                    e.preventDefault()
                    ref.classList.remove("dragover", "invalid")
                }}
            />
            <Show when={src()}
                fallback={<span class="file-title">Drop actor photo, or click to browse</span>}
            >
                <img
                    src={src()}
                    alt=""
                    onerror={() => setErrored(true)}
                />
            </Show>
        </label>
    )
}