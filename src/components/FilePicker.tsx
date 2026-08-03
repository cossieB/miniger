import { type Setter } from "solid-js";

type Props = {
    setFile: Setter<File | null>
    setObjectUrl: (file: File) => void
}

export function DropZone(props: Props) {
    let ref!: HTMLLabelElement
        
    return (
        <>
            <label
                ref={ref}
                class="file-drop"
                onDragOver={e => e.preventDefault()}

                onDrop={async e => {
                    e.preventDefault()
                    ref.classList.remove("invalid", "dragover")
                    if (!e.dataTransfer?.files.length) return;
                    const file = e.dataTransfer.files[0];
                    if (!file.type.startsWith("image")) return;
                    props.setObjectUrl(file)
                    props.setFile(file)
                }}
            >
                <input
                    type="file"
                    id="file-input"
                    accept="image/*"
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
                <span class="file-title">Drop actor photo, or click to browse</span>
                <span class="file-name" id="file-name"></span>
            </label>
        </>
    )
}