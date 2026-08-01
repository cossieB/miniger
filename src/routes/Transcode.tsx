import { For, Show, createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { DropPayload } from "~/events/types";
import { filterMap } from "~/lib/filterMap";
import videoExtensions from "../videoExtensions.json"
import { XIcon } from "lucide-solid";
import { createStore } from "solid-js/store";
import styles from "../windows/Windows.module.css"

type F = {
    src: string
    status: "COMPLETE" | "PENDING" | "PROCESSING" | "ERROR"
    dest: string
}

export default function Transcode() {
    const [files, setFiles] = createStore<F[]>([])
    const [isConverting, setIsConverting] = createSignal(false)

    onMount(() => {
        const window = getCurrentWindow()
        window.listen<DropPayload>("tauri://drag-drop", (event) => {
            const paths = event.payload.paths;

            const files = filterMap(paths,
                file => {
                    let idx = file.lastIndexOf(".")
                    if (idx < 0)
                        return false
                    const extension = file.slice(idx + 1).toLowerCase();
                    if (!extension) return false
                    return videoExtensions.includes(extension.toLowerCase())
                },
                file => {
                    const i = file.lastIndexOf(".")
                    const dest = file.slice(0, i) + "_new" + file.slice(i)
                    return {
                        src: file,
                        status: "PENDING" as const,
                        dest
                    }
                })

            setFiles(files)
        })
    })
    return (
        <div class={styles.transcode}>
            <div >
                <div >Source</div>
                <div >Destination</div>
                <div >Status</div>
                <div></div>
                <For each={files}>
                    {(file, i) =>
                        <>
                            <div class={styles.path} > {file.src} </div>
                            <div class={styles.path} > {file.dest} </div>
                            <div> {file.status} </div>
                            <div onclick={() => setFiles(prev => prev.filter((_, j) => j != i()))} >
                                <XIcon />
                            </div>
                        </>
                    }
                </For>

            </div>
            <Show
                when={files.length > 0}
                fallback={
                    <div class={styles.instr}>
                        Drop videos here
                    </div>
                }
            >
                <button

                    disabled={isConverting()}
                    class="w-full bg-amber-600"
                    onclick={async () => {
                        setIsConverting(true)
                        for (const [i, file] of files.entries()) {
                            setFiles(i, 'status', 'PROCESSING')
                            try {
                                await invoke("transcode", { src: file.src, dest: file.dest })
                                setFiles(i, 'status', 'COMPLETE')
                            }
                            catch (error) {
                                setFiles(i, 'status', 'ERROR')
                            }
                        }
                        setIsConverting(false)
                    }}
                >
                    Convert
                </button>
            </Show>
        </div>
    )
}