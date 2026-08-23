import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { open, save } from "@tauri-apps/plugin-dialog"
import { createSignal, onMount } from "solid-js"
import styles from "./Windows.module.css"

export function Convert() {
    const [source, setSource] = createSignal("")
    const [destination, setDestination] = createSignal("")
    const [isBusy, setIsBusy] = createSignal(false)
    const [message, setMessage] = createSignal("")

    onMount(() => {
        getCurrentWindow().listen<{paths: string[]}>("tauri://drag-drop", e => {
            if (isBusy()) return;
            setMessage("");
            const path = e.payload.paths[0];
            let idx = path.lastIndexOf(".")
            if (idx < 0) 
                return;
            const extension = path.slice(idx + 1);
            if (!extension) return
            if (["mpcpl", "asx", "m3u", "pls"].includes(extension.toLowerCase()))
                setSource(path)
        })
    })

    return (
        <div class={styles.convert} oncontextmenu={e => e.preventDefault()}>
            <div
                class="grid grid-cols-[auto_1fr] gap-2 items-center"
            >
                <button
                    class="bg-slate-700 rounded-sm p-1 w-full shadow-black shadow-2xs"
                    onclick={async () => {
                        setMessage("")
                        const selection = await open({
                            title: "Source Playlist",
                            filters: [{
                                name: "Playlist File",
                                extensions: ["m3u", "m3u8", "asx", "pls", "mpcpl"]
                            }]
                        })
                        selection && setSource(selection)
                    }}
                >
                    Select Source File
                </button >
                <span>
                    {source()}
                </span>
                <button
                    class="bg-slate-700 rounded-sm p-1 w-full shadow-black shadow-2xs"
                    onclick={async () => {
                        setMessage("")
                        const selection = await save({
                            title: "Save Playlist",
                            filters: [{
                                name: "Winamp Playlist",
                                extensions: ["m3u"],
                            }, {
                                name: "Windows Media Playlist",
                                extensions: ["asx"],
                            }, {
                                name: "Playlist",
                                extensions: ["pls"],
                            }, {
                                name: "MPC Playlist",
                                extensions: ["mpcpl"],
                            }]
                        })
                        selection && setDestination(selection)
                    }}

                >
                    Select Destination
                </button>
                <span>
                    {destination()}
                </span>
                <button
                    disabled={!source() || !destination() || isBusy()}
                    class={styles.submitBtn}
                    onclick={async () => {
                        setIsBusy(true)
                        try {
                            await invoke("convert_playlist", {
                                source: source(),
                                destination: destination(),
                            })
                            setMessage("Conversion complete");
                            setSource("")
                            setDestination("")
                        } 
                        catch (error: any) {
                            console.error(error)
                            setMessage("Conversion error: " + error.message)
                        }
                        finally {
                            setIsBusy(false);
                        }
                    }}>
                    Save
                </button>
            </div>
            <span>
                {message()}
            </span>
        </div>
    )
}