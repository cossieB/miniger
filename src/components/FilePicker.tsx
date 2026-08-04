import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, sep } from "@tauri-apps/api/path";
import { createSignal, onCleanup, Show, type Setter } from "solid-js";

type Props = {
    setFile: Setter<File | null>
    image?: string | null
}

const d = await appDataDir()
const dir = d + sep() + "images" + sep()

export function DropZone(props: Props) {
    let ref!: HTMLLabelElement
    const [objectUrl, setObjectUrl] = createSignal("")
    onCleanup(() => URL.revokeObjectURL(objectUrl()));

    const src = () => {
        if (objectUrl())
            return objectUrl()
        if (props.image)
            return convertFileSrc(dir + props.image)
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
                    const hasImage = items.some(item => item.kind === 'file' && item.type.startsWith('image/'));
                    if (hasImage) {
                        ref.classList.add('dragover');
                    } else {
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
                <img src={src()} alt="" />
            </Show>
        </label>
    )
}